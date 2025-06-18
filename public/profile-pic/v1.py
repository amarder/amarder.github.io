from PIL import Image
import lxml.builder
import random
from torchvision import transforms
import numpy as np
import subprocess
from tqdm import tqdm
import numpy as np

E = lxml.builder.ElementMaker()
convert_tensor = transforms.ToTensor()

def d(x, y):
    x1 = convert_tensor(x)
    x2 = convert_tensor(y)
    n = np.prod(x1.shape)
    return ((x1.reshape(n) - x2.reshape(n))**2).sum().item()

class Drawing:

    def __init__(self, source, destination, line_length=15, palette=((0, 0, 0), (212, 155, 136), (119, 74, 62), (255, 255, 255))):
        self.source = source
        self.destination = destination
        self.image = Image.open(source)
        self.pixels = self.image.load()
        self.lines = []
        self.line_length = line_length
        self.palette = palette
        self._reset_points()

    def _reset_points(self):
        self.points = {(i, j) for i in range(self.image.width) for j in range(self.image.height)}

    def _closest_color(self, x):
        # TODO: Make sure indexes start at zero
        if (x[0] < 0) or (x[0] >= self.width) or (x[1] < 0) or (x[1] >= self.height):
            raise IndexError
        actual_color = self.pixels[x[0], x[1]]
        def dist(x, y):
            return sum([(i - j)**2 for i, j in zip(x, y)])
        argmin = self.palette[0]
        min_dist = dist(actual_color, argmin)
        for color in self.palette[1:]:
            if dist(actual_color, color) < min_dist:
                min_dist = dist(actual_color, color)
                argmin = color
        return argmin
    
    # for now let's just focus on black and white
    def candidate_line(self):
        point = random.choice(list(self.points))

        dx, dy = random.choice([(1, 0), (0, 1), (1, 1), (1, -1)])
        point_color = self._closest_color(point)

        nforward = 0
        while True:
            curr_point = (point[0] + dx * (nforward+1), point[1] + dy * (nforward+1))
            try:
                matches = self._closest_color(curr_point) == point_color
            except IndexError:
                break
            if not matches:
                break
            nforward += 1

        nbackward = 0
        while True:
            curr_point = (point[0] - dx * (nbackward+1), point[1] - dy * (nbackward+1))
            try:
                matches = self._closest_color(curr_point) == point_color
            except IndexError:
                break
            if not matches:
                break
            nbackward += 1

        x1 = point[0] - nbackward * dx
        x2 = point[0] + nforward * dx
        y1 = point[1] - nbackward * dy
        y2 = point[1] + nforward * dy

        line = ((x1, y1), (x2, y2))
        info = {'line': line, 'dx': dx, 'dy': dy, 'nforward': nforward, 'nbackward': nbackward, 'point': point}

        assert (0 <= x1) and (x1 < self.width), info
        assert (0 <= x2) and (x2 < self.width), info
        assert (0 <= y1) and (y1 < self.height), info
        assert (0 <= y2) and (y2 < self.height), info

        rgb = lambda x: f'rgb({x[0]}, {x[1]}, {x[2]})'
        return ((x1, y1), (x2, y2), rgb(point_color))

    def svg_lines(self):
        for l in self.lines:
            kwargs = {
                "x1": str(l[0][0]),
                "y1": str(l[0][1]),
                "x2": str(l[1][0]),
                "y2": str(l[1][1]),
                "stroke": l[2],
                "stroke-width": "1",
                "stroke-linecap": "round",
            }
            yield E.line(**kwargs)

    @property
    def height(self):
        return self.image.height

    @property
    def width(self):
        return self.image.width

    def svg(self):
        return E.svg(
            E.rect(fill=f"rgb({self.palette[0][0]}, {self.palette[0][1]}, {self.palette[0][2]})", width=str(self.width), height=str(self.height)),
            *self.svg_lines(),
            xmlns="http://www.w3.org/2000/svg",
            viewBox=f"0 0 {self.width} {self.height}"
        )

    def write_svg(self):
        doc = self.svg()
        doc.getroottree().write(self.destination, pretty_print=True)

    def _current_distance(self):
        self.write_svg()
        cmd = f'cairosvg --output-width {self.width} --output-height {self.height} {self.destination} -o temp.png'
        subprocess.call(cmd, shell=True)
        candidate = Image.open('temp.png')
        return d(self.image, candidate)

    def _remove_line(self, p1, p2):
        # remove the points covered by the last line
        dx = np.sign(p2[0] - p1[0])
        dy = np.sign(p2[1] - p1[1])
        if p1 in self.points:
            self.points.remove(p1)
        while p1 != p2:
            p1 = (p1[0] + dx, p1[1] + dy)
            if p1 in self.points:
                self.points.remove(p1)

    def draw(self):
        min_dist = self._current_distance()
        pbar = tqdm(range(10000))
        for i in pbar:
            self.lines.append(self.candidate_line())
            curr_dist = self._current_distance()
            if curr_dist < min_dist:
                min_dist = curr_dist
                # remove the points covered by the last line
                p1, p2, color = self.lines[-1]
                self._remove_line(p1, p2)
            else:
                self.lines.pop()
            pbar.set_description(f'{min_dist:.2f}')

    def fast_draw(self):
        pbar = tqdm(range(8000))
        for i in pbar:
            try:
                self.lines.append(self.candidate_line())
            except IndexError:
                break
            p1, p2, color = self.lines[-1]
            self._remove_line(p1, p2)
            msg = f'{len(self.points)} points left'
            pbar.set_description(msg)
        self._current_distance()

fairey = [
        # (216, 25, 33),
        (0, 49, 79),
        (115, 149, 158),
        # (195, 195, 161),
        (252, 228, 168),
    ]
drawing = Drawing(
    'profile.jpg',
    'profile.svg',
    palette=fairey + [(0, 0, 0)] # [(0, 49, 79), (128, 128, 128), (64, 64, 64), (0, 0, 0), (252, 228, 168)]
)
drawing.fast_draw()
cmd = f'cairosvg --output-width 675 --output-height 675 {drawing.destination} -o tweet.png'
print(cmd)
subprocess.call(cmd, shell=True)
