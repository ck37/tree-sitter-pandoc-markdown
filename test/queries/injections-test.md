# Injections Test File

Test language injection for syntax highlighting inside code blocks.

## Python

```python
def fibonacci(n):
    """Calculate fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Test call
print(fibonacci(10))
```

## JavaScript

```javascript
const greet = (name) => {
  console.log(`Hello, ${name}!`);
};

greet('World');
```

## Bash/Shell

```bash
#!/bin/bash
echo "Starting script..."
for i in {1..5}; do
  echo "Iteration $i"
done
```

```sh
ls -la | grep ".md"
cat file.txt | wc -l
```

## R

```r
# R code
data <- c(1, 2, 3, 4, 5)
mean_value <- mean(data)
plot(data, main="My Plot")
```

## TypeScript

```typescript
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: "John",
  age: 30
};
```

## YAML

```yaml
title: Document
author: Name
metadata:
  key: value
  list:
    - item1
    - item2
```

## JSON

```json
{
  "name": "test",
  "version": "1.0.0",
  "dependencies": {
    "package": "^1.0.0"
  }
}
```

## CSS

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

#main {
  background-color: #333;
}
```

## HTML

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Test</title>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>
```

## SQL

```sql
SELECT users.name, orders.total
FROM users
INNER JOIN orders ON users.id = orders.user_id
WHERE orders.total > 100
ORDER BY orders.total DESC;
```

## LaTeX Math

Inline math $\int_0^\infty e^{-x^2} dx$ with LaTeX.

Display math:
$$
\begin{align}
E &= mc^2 \\
F &= ma
\end{align}
$$

## Raw HTML Block

```{=html}
<div class="custom-component">
  <h2>Title</h2>
  <p>Content with <strong>HTML</strong> tags.</p>
</div>
```

## Raw LaTeX Block

```{=latex}
\begin{equation}
\label{eq:important}
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
\end{equation}
```

## Inline Raw

This has raw HTML `<span class="test">content</span>`{=html} inline.

And raw LaTeX `\textbf{bold text}`{=latex} too.

## YAML Front Matter

---
title: Test Document
author: Test Author
lang: en-US
bibliography: refs.bib
---

## Quarto Chunk Options

```{python}
#| label: fig-plot
#| fig-cap: "A scatter plot"
#| echo: false
#| warning: false

import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)
plt.plot(x, y)
plt.show()
```
