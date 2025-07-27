import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import hsv_to_rgb
import matplotlib.patches as patches

def create_mandelbrot_banner():
    """Create a beautiful Mandelbrot set visualization"""
    width, height = 1500, 500
    
    # Define the complex plane bounds
    xmin, xmax = -2.5, 1.5
    ymin, ymax = -0.75, 0.75
    
    # Create coordinate arrays
    x = np.linspace(xmin, xmax, width)
    y = np.linspace(ymin, ymax, height)
    X, Y = np.meshgrid(x, y)
    C = X + 1j * Y
    
    # Initialize Z and iteration count arrays
    Z = np.zeros_like(C)
    iterations = np.zeros(C.shape, dtype=int)
    
    max_iter = 100
    
    # Calculate Mandelbrot set
    for i in range(max_iter):
        mask = np.abs(Z) <= 2
        Z[mask] = Z[mask]**2 + C[mask]
        iterations[mask] = i
    
    # Create the plot
    fig, ax = plt.subplots(figsize=(15, 5), dpi=100)
    ax.imshow(iterations, extent=[xmin, xmax, ymin, ymax], 
              cmap='hot', origin='lower', interpolation='bilinear')
    
    ax.set_title('Mandelbrot Set - Infinite Complexity at the Boundary', 
                 fontsize=16, color='white', pad=20)
    ax.axis('off')
    fig.patch.set_facecolor('black')
    
    plt.tight_layout()
    plt.savefig('mandelbrot_banner.png', dpi=100, bbox_inches='tight', 
                facecolor='black', edgecolor='none')
    plt.close()

def create_complex_domain_coloring():
    """Visualize complex functions using RGB domain coloring"""
    width, height = 1500, 500
    
    # Create complex plane
    real = np.linspace(-2, 2, width)
    imag = np.linspace(-0.67, 0.67, height)
    Real, Imag = np.meshgrid(real, imag)
    Z = Real + 1j * Imag
    
    # Apply three variations of the same function with horizontal shifts
    # Define the shift amount
    shift = 1.2
    
    # Red channel: f1(z) = 1/((z - shift)^2 + 1) - shifted left
    W1 = 1 / ((Z - shift)**2 + 1)
    
    # Green channel: f2(z) = 1/((z + shift)^2 + 1) - shifted right  
    W2 = 1 / ((Z + shift)**2 + 1)
    
    # Blue channel: f3(z) = 1/(z^2 + 1) - original (center)
    W3 = 1 / (Z**2 + 1)
    
    # Extract magnitudes for each channel (same property extraction for all)
    # Red: Magnitude of shifted left function
    red = np.abs(W1)
    red = (red - np.min(red)) / (np.max(red) - np.min(red))  # Normalize to [0,1]
    
    # Green: Magnitude of shifted right function
    green = np.abs(W2)
    green = (green - np.min(green)) / (np.max(green) - np.min(green))  # Normalize to [0,1]
    
    # Blue: Magnitude of original function
    blue = np.abs(W3)
    blue = (blue - np.min(blue)) / (np.max(blue) - np.min(blue))  # Normalize to [0,1]
    
    # Create RGB array
    rgb = np.stack([red, green, blue], axis=-1)
    
    # Ensure RGB values are in [0,1] range
    rgb = np.clip(rgb, 0, 1)
    
    # Create the plot
    fig, ax = plt.subplots(figsize=(15, 5), dpi=100)
    ax.imshow(rgb, extent=[-2, 2, -0.67, 0.67], origin='lower')
    
    ax.set_title('RGB Complex Domain Coloring\nR: |1/((z-1.2)²+1)|, G: |1/((z+1.2)²+1)|, B: |1/(z²+1)|', 
                 fontsize=13, color='white', pad=20)
    ax.axis('off')
    fig.patch.set_facecolor('black')
    
    plt.tight_layout()
    plt.savefig('complex_rgb_banner.png', dpi=100, bbox_inches='tight',
                facecolor='black', edgecolor='none')
    plt.close()

def create_parametric_art():
    """Create beautiful parametric mathematical art"""
    fig, ax = plt.subplots(figsize=(15, 5), dpi=100)
    
    # Parameters for different curves
    t = np.linspace(0, 20*np.pi, 10000)
    
    # Rose curve: r = sin(n*θ)
    n = 5
    r1 = np.sin(n * t)
    x1 = r1 * np.cos(t) * 2
    y1 = r1 * np.sin(t) * 2
    
    # Spiral
    r2 = t / 10
    x2 = r2 * np.cos(t) / 5 - 4
    y2 = r2 * np.sin(t) / 5
    
    # Lissajous curve
    a, b = 3, 4
    x3 = 3 * np.sin(a * t) + 4
    y3 = 2 * np.cos(b * t)
    
    # Plot curves with different colors and transparency
    ax.plot(x1, y1, color='cyan', alpha=0.8, linewidth=0.5)
    ax.plot(x2, y2, color='magenta', alpha=0.8, linewidth=0.5)
    ax.plot(x3, y3, color='yellow', alpha=0.8, linewidth=0.5)
    
    ax.set_xlim(-8, 8)
    ax.set_ylim(-2.5, 2.5)
    ax.set_title('Parametric Mathematical Art: Roses, Spirals & Lissajous Curves', 
                 fontsize=16, color='white', pad=20)
    ax.axis('off')
    ax.set_facecolor('black')
    fig.patch.set_facecolor('black')
    
    plt.tight_layout()
    plt.savefig('parametric_art_banner.png', dpi=100, bbox_inches='tight',
                facecolor='black', edgecolor='none')
    plt.close()

def create_fourier_visualization():
    """Visualize Fourier series - how sine waves combine"""
    fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(15, 5), dpi=100)
    
    x = np.linspace(0, 4*np.pi, 1000)
    
    # Individual sine wave components
    y1 = np.sin(x)
    y2 = np.sin(3*x) / 3
    y3 = np.sin(5*x) / 5
    y4 = np.sin(7*x) / 7
    
    # Combined wave (approximating a square wave)
    y_combined = y1 + y2 + y3 + y4
    
    # Plot individual components
    ax1.plot(x, y1, 'cyan', alpha=0.8, linewidth=2, label='sin(x)')
    ax1.plot(x, y2, 'magenta', alpha=0.8, linewidth=2, label='sin(3x)/3')
    ax1.plot(x, y3, 'yellow', alpha=0.8, linewidth=2, label='sin(5x)/5')
    ax1.set_ylabel('Amplitude', color='white')
    ax1.legend(loc='upper right')
    ax1.grid(True, alpha=0.3)
    
    # Plot combination
    ax2.plot(x, y_combined, 'white', linewidth=3, label='Combined')
    ax2.set_ylabel('Sum', color='white')
    ax2.legend(loc='upper right')
    ax2.grid(True, alpha=0.3)
    
    # 2D visualization showing the wave in space
    X, T = np.meshgrid(x, np.linspace(0, 1, 50))
    Z = np.sin(X)
    ax3.contourf(X, T, Z, levels=50, cmap='plasma')
    ax3.set_xlabel('x', color='white')
    ax3.set_ylabel('Time', color='white')
    
    # Style all axes
    for ax in [ax1, ax2, ax3]:
        ax.set_facecolor('black')
        ax.tick_params(colors='white')
        ax.spines['bottom'].set_color('white')
        ax.spines['top'].set_color('white')
        ax.spines['right'].set_color('white')
        ax.spines['left'].set_color('white')
    
    fig.suptitle('Fourier Series: How Sine Waves Combine to Create Complex Patterns', 
                 fontsize=14, color='white', y=0.95)
    fig.patch.set_facecolor('black')
    
    plt.tight_layout()
    plt.savefig('fourier_banner.png', dpi=100, bbox_inches='tight',
                facecolor='black', edgecolor='none')
    plt.close()

def create_electromagnetic_field():
    """Create electromagnetic field visualization adapted for banner dimensions"""
    # Creating coordinates - adjusted for 3:1 aspect ratio
    x = np.arange(-7.5, 7.5, 0.15)  # Wider range for banner aspect ratio
    y = np.arange(-2.5, 2.5, 0.1)   # Narrower range to fit banner height
    
    # Creating a meshgrid
    X, Y = np.meshgrid(x, y)
    
    # Assigning vector directions (electromagnetic field)
    # Two point charges: one at (-2, 0) and one at (2, 0) - spread out for banner
    charge_sep = 3.0  # Separation between charges
    Ex = (X + charge_sep)/((X + charge_sep)**2 + Y**2) - (X - charge_sep)/((X - charge_sep)**2 + Y**2)
    Ey = Y/((X + charge_sep)**2 + Y**2) - Y/((X - charge_sep)**2 + Y**2)
    
    # Create the plot with exact dimensions
    fig, ax = plt.subplots(figsize=(15, 5), dpi=100)
    
    # Remove all margins and padding to fill the entire 1500x500 space
    fig.subplots_adjust(left=0, right=1, top=1, bottom=0)
    ax.set_position([0, 0, 1, 1])  # Fill entire figure
    
    # Create streamplot with custom styling
    stream = ax.streamplot(X, Y, Ex, Ey, density=1, linewidth=1, 
                          color='black', arrowsize=1.2, arrowstyle='->')
    
    # Add the point charges
    ax.plot(-charge_sep, 0, 'o', color='red', markersize=12, markeredgecolor='black', 
            markeredgewidth=2, label='Positive Charge')
    ax.plot(charge_sep, 0, 'o', color='blue', markersize=12, markeredgecolor='black', 
            markeredgewidth=2, label='Negative Charge')
    
    # Styling
    ax.set_xlim(-7.5, 7.5)
    ax.set_ylim(-2.5, 2.5)
    ax.set_facecolor('white')
    ax.grid(True, alpha=0.2, color='gray')
    
    # Remove axes and ticks for clean banner
    ax.set_xticks([])
    ax.set_yticks([])
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['bottom'].set_visible(False)
    ax.spines['left'].set_visible(False)
    
    fig.patch.set_facecolor('white')
    
    plt.savefig('electromagnetic_field_banner.png', dpi=100, 
                facecolor='white', edgecolor='none', pad_inches=0)
    plt.close()

def create_julia_set():
    """Create a beautiful Julia set fractal"""
    width, height = 1500, 500
    
    # Julia set parameter
    c = -0.7 + 0.27015j  # Interesting Julia set parameter
    
    # Define the complex plane bounds
    xmin, xmax = -2, 2
    ymin, ymax = -0.75, 0.75
    
    # Create coordinate arrays
    x = np.linspace(xmin, xmax, width)
    y = np.linspace(ymin, ymax, height)
    X, Y = np.meshgrid(x, y)
    Z = X + 1j * Y
    
    iterations = np.zeros(Z.shape, dtype=int)
    max_iter = 100
    
    # Calculate Julia set
    for i in range(max_iter):
        mask = np.abs(Z) <= 2
        Z[mask] = Z[mask]**2 + c
        iterations[mask] = i
    
    # Create the plot
    fig, ax = plt.subplots(figsize=(15, 5), dpi=100)
    ax.imshow(iterations, extent=[xmin, xmax, ymin, ymax], 
              cmap='plasma', origin='lower', interpolation='bilinear')
    
    ax.set_title(f'Julia Set with c = {c:.3f}', 
                 fontsize=16, color='white', pad=20)
    ax.axis('off')
    fig.patch.set_facecolor('black')
    
    plt.tight_layout()
    plt.savefig('julia_set_banner.png', dpi=100, bbox_inches='tight',
                facecolor='black', edgecolor='none')
    plt.close()

if __name__ == "__main__":
    print("Creating mathematical visualization banners...")
    
    # Uncomment the ones you want to generate:
    # create_mandelbrot_banner()
    # create_complex_domain_coloring()  # RGB version with 3 different complex functions
    # create_parametric_art()
    # create_fourier_visualization()
    # create_julia_set()
    create_electromagnetic_field()
    
    print("Electromagnetic field banner created successfully!")
    print("Generated file:")
    print("- electromagnetic_field_banner.png")
