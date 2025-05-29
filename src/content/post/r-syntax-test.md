---
title: "R Syntax Highlighting Test"
description: "Testing R syntax highlighting capabilities with various code examples including ggplot2, dplyr, and statistical functions."
publishDate: "2000-01-01"
draft: true
---

# R Syntax Highlighting Test

Here's an example of R code with syntax highlighting:

```r
# Load required libraries
library(ggplot2)
library(dplyr)

# Load mtcars dataset
data(mtcars)

# Basic data exploration
head(mtcars)
summary(mtcars)

# Create a scatter plot
ggplot(mtcars, aes(x = wt, y = mpg)) +
  geom_point(aes(color = factor(cyl)), size = 3) +
  geom_smooth(method = "lm", se = FALSE) +
  labs(
    title = "Fuel Efficiency vs Weight",
    x = "Weight (1000 lbs)",
    y = "Miles per Gallon",
    color = "Cylinders"
  ) +
  theme_minimal()

# Data manipulation with dplyr
mtcars_summary <- mtcars %>%
  group_by(cyl) %>%
  summarise(
    mean_mpg = mean(mpg),
    mean_hp = mean(hp),
    count = n()
  ) %>%
  arrange(desc(mean_mpg))

print(mtcars_summary)

# Function definition
calculate_efficiency <- function(mpg, weight) {
  efficiency <- mpg / weight
  return(efficiency)
}

# Apply function
mtcars$efficiency <- calculate_efficiency(mtcars$mpg, mtcars$wt)

# Simple statistical test
t_test_result <- t.test(mpg ~ am, data = mtcars)
print(t_test_result)
```

The R language is already supported by Shiki (the syntax highlighter used by expressive-code) by default! 