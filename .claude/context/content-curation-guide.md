# Content Curation Guide for Visualization Resources

This guide explains how to effectively extract and structure content from data-to-viz.com, matplotlib documentation, and other visualization resources to provide optimal context to Claude.

## What to Extract (Priority Order)

### 1. **Decision Logic** (Highest Priority)
Extract the "when to use" criteria:

**From data-to-viz.com**:
- "When to use this chart type" section
- Data structure requirements
- Number of variables supported
- Common pitfalls

**Example extraction**:
```markdown
## Line Chart Decision Criteria

**Use when**:
- Showing trends over time
- Data is continuous
- Emphasizing the flow/change rather than individual values

**Don't use when**:
- Data is categorical (use bar chart)
- Many series make it unreadable (use small multiples)
- Changes are negligible (table may be better)
```

### 2. **Visual Examples with Code** (High Priority)
Extract code snippets with context:

**From matplotlib docs**:
- Working code examples
- Parameter explanations
- Output images

**Structure**:
```markdown
### Example: [Description]

**Code**:
```python
# Code here with comments
```

**Key Parameters**:
- `alpha=0.7`: Transparency (0=invisible, 1=opaque)
- `linewidth=2`: Thickness of line in points
- `marker='o'`: Data point shape

**Output**: [Screenshot or description]
```

### 3. **Best Practices** (High Priority)
Extract specific guidelines:

**From both sources**:
- Accessibility recommendations
- Color palette choices
- Typography rules
- Responsive design patterns

**Structure**:
```markdown
## Best Practices: [Topic]

✓ **Do**: [Specific action with rationale]
✗ **Don't**: [Specific anti-pattern with explanation why]

**Example**:
✓ Do: Use diverging color scale for data with meaningful midpoint (e.g., 0, average)
   Rationale: Helps viewer immediately identify above/below average values

✗ Don't: Use red-green as only differentiator
   Rationale: ~8% of men have red-green colorblindness
```

### 4. **Implementation Patterns** (Medium Priority)
Extract reusable code structures:

**From matplotlib gallery**:
```python
# PATTERN: Subplot grid with shared axes
fig, axes = plt.subplots(nrows, ncols,
                          figsize=(width, height),
                          sharey=True,  # Share Y-axis
                          sharex=True)  # Share X-axis

for ax, data in zip(axes.flatten(), datasets):
    ax.plot(data)
    # Configure each subplot
```

### 5. **Parameter Reference** (Lower Priority)
Only extract commonly used parameters:

**Skip**: Exhaustive API documentation (Claude can look this up)
**Keep**: Frequently used parameter combinations

## What NOT to Extract

❌ **Skip these**:
- Boilerplate explanations of what a chart is
- Exhaustive parameter lists (available in docs)
- Theoretical statistics background
- Installation instructions
- Changelog/version history
- Generic design theory (unless specific to charts)

## Extraction Workflow

### Step 1: Identify Target Pages

**Data-to-viz.com**:
```
Priority pages:
1. https://www.data-to-viz.com/graph/line.html
2. https://www.data-to-viz.com/graph/barplot.html
3. https://www.data-to-viz.com/graph/area.html
4. https://www.data-to-viz.com/graph/scatter.html
5. https://www.data-to-viz.com/graph/choropleth.html
6. https://www.data-to-viz.com/caveat/pie.html (anti-pattern)
7. https://www.data-to-viz.com/caveat/spider.html (anti-pattern)

Context pages:
- https://www.data-to-viz.com/#explore (decision tree)
- Color palette guides
```

**Matplotlib**:
```
Priority pages:
1. https://matplotlib.org/stable/gallery/index.html (examples)
2. https://matplotlib.org/stable/tutorials/colors/colormaps.html
3. https://matplotlib.org/stable/tutorials/text/annotations.html
4. https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.html (common functions)

Skip:
- Low-level API documentation
- Backend configuration
- Advanced 3D plotting
```

### Step 2: Use WebFetch for Extraction

**Template prompt for WebFetch**:
```
Extract from this page:
1. When to use this chart type (decision criteria)
2. Common pitfalls or anti-patterns
3. Code examples with explanation
4. Best practice recommendations

Format as markdown with:
- Clear section headers
- Code blocks with syntax highlighting
- Do/Don't checklists
- Link to original source
```

**Example**:
```bash
WebFetch(
  url="https://www.data-to-viz.com/graph/line.html",
  prompt="Extract: 1) When to use line charts vs alternatives,
          2) Common mistakes, 3) Best practices for styling.
          Format as markdown."
)
```

### Step 3: Curate and Structure

**Template structure**:
```markdown
# [Chart Type] - [Source]

## Decision Criteria
[When to use, when not to use]

## Data Requirements
[Structure, format, preprocessing needs]

## Implementation
### Chart.js
[Web implementation]

### Matplotlib
[Python implementation]

### D3.js (if complex)
[Custom visualization]

## Styling Best Practices
[Colors, typography, spacing]

## Accessibility
[Screen readers, keyboard nav, colorblind-safe]

## Common Pitfalls
[Anti-patterns with solutions]

## Examples
[Real-world use cases]

**Source**: [URL]
**Last Updated**: [Date]
```

### Step 4: Test with Claude

Ask Claude to use the curated content:

```
"Using the viz-examples.md context, create a line chart
showing Chilean regional employment data with:
- Monthly data from 2020-2024
- 4 regions compared
- Annotation for pandemic start
- Responsive design"
```

If Claude asks for information not in the context, that's a gap to fill.

## Automated Extraction Script (Optional)

If you want to automate extraction:

```python
# extract_viz_content.py
import requests
from bs4 import BeautifulSoup
import anthropic

def extract_page_content(url):
    """Fetch and extract key content from viz resource page."""
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Extract main content
    # (Implementation depends on site structure)

    return {
        'url': url,
        'title': soup.find('h1').text,
        'content': soup.find('main').text,
        'code_examples': [code.text for code in soup.find_all('code')]
    }

def curate_with_claude(raw_content):
    """Use Claude to structure and curate the extracted content."""
    client = anthropic.Anthropic()

    prompt = f"""
    Given this raw content from a visualization resource page:

    {raw_content}

    Extract and structure:
    1. Decision criteria (when to use this chart)
    2. Code examples with explanations
    3. Best practices
    4. Common pitfalls

    Format as markdown following the template in content-curation-guide.md
    """

    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}]
    )

    return message.content[0].text

# Main workflow
urls = [
    "https://www.data-to-viz.com/graph/line.html",
    "https://www.data-to-viz.com/graph/barplot.html",
    # ... more URLs
]

for url in urls:
    raw = extract_page_content(url)
    curated = curate_with_claude(raw)

    # Save to context file
    with open(f'.claude/context/charts/{chart_type}.md', 'w') as f:
        f.write(curated)
```

## Matplotlib-Specific Extraction

### Gallery Examples
**What to extract**:
```python
# From matplotlib gallery, extract:
1. Figure setup (size, DPI, layout)
2. Data generation (understand what data structure is expected)
3. Plotting calls (main visualization code)
4. Styling (colors, fonts, etc.)
5. Annotations (labels, arrows, text)

# Example structure:
"""
Gallery Example: [Name]
Source: [URL]

Purpose: [What problem this solves]

Data Structure:
- X: [Description, shape, type]
- Y: [Description, shape, type]

Code Pattern:
[Annotated code]

Key Takeaways:
- [Insight 1]
- [Insight 2]
"""
```

### API Patterns
**Most common matplotlib patterns**:
```python
# Extract these common workflows:

# 1. Figure creation
fig, ax = plt.subplots()  # Single plot
fig, axes = plt.subplots(2, 2)  # Grid

# 2. Plotting
ax.plot()      # Line
ax.scatter()   # Points
ax.bar()       # Bars
ax.fill_between()  # Area

# 3. Styling
ax.set_xlabel()
ax.set_title()
ax.legend()
ax.grid()

# 4. Customization
ax.spines['top'].set_visible(False)  # Clean look
ax.tick_params()
```

## Maintenance Schedule

**Quarterly review**:
- [ ] Check data-to-viz.com for new chart types
- [ ] Review matplotlib gallery for new examples
- [ ] Update color palettes if brand changes
- [ ] Test all code examples still work
- [ ] Add new economic data conventions if discovered

**After each major visualization project**:
- [ ] Document new patterns used
- [ ] Add to examples library
- [ ] Note what worked well
- [ ] Note what Claude struggled with

## Quality Checklist

Before adding curated content to context:

- [ ] **Actionable**: Can Claude immediately use this?
- [ ] **Specific**: Concrete examples, not abstract theory?
- [ ] **Complete**: Includes both Chart.js AND matplotlib?
- [ ] **Tested**: Code examples actually work?
- [ ] **Branded**: Adapted to use our color palette?
- [ ] **Linked**: Original source attributed?
- [ ] **Concise**: No redundant information?
- [ ] **Structured**: Follows consistent template?

## Context Size Management

**Target**: Keep total context under 50KB (roughly 12,500 tokens)

**If exceeding**:
1. Split by chart type into separate files
2. Use slash commands to load specific contexts
3. Remove low-priority information
4. Compress code examples (remove comments)

**Optimal structure**:
```
.claude/context/
  viz-knowledge-base.md      # ~8KB - Core principles
  viz-examples.md            # ~15KB - Common charts
  viz-advanced.md            # ~10KB - Complex patterns
  viz-economic-specific.md   # ~5KB - Domain knowledge
```

Load based on task:
- Simple chart → knowledge-base + examples
- Complex visualization → all files
- Economic dashboard → all + economic-specific

## Legal & Ethical Considerations

**Before scraping**:
- [ ] Check robots.txt
- [ ] Review terms of service
- [ ] Respect rate limits
- [ ] Attribute sources
- [ ] Don't republish wholesale (curate/transform)

**Data-to-viz.com**: Open source educational resource, ok to reference
**Matplotlib docs**: BSD license, ok to use with attribution
**Commercial resources**: May require permission

**Best practice**: Link to original, extract key insights only
