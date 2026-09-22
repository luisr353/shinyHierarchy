# shinyHierarchy

Hierarchical slicer-style input for Shiny, inspired by Power BI date hierarchies.

## Features

- Multi-level tree from a data frame and `levels`
- Inline Power BI-style slicer or compact dropdown
- Optional search and select-all row
- Cascading checkboxes with tri-state parents
- Structured Shiny value (`schema_version = 1`) with `resolved`, `rollup`, `explicit`, and `summary`

## Example

```r
library(shiny)
library(shinyHierarchy)

df <- data.frame(
  year = c(2026, 2026),
  month = c("January", "January"),
  day = c(1, 2)
)

ui <- fluidPage(
  hierarchyInput(
    "dates",
    "Año, Mes, Día",
    df,
    c("year", "month", "day"),
    display = "inline"
  )
)

server <- function(input, output, session) {
  observe(print(hierarchyResolved(input$dates)))
}

shinyApp(ui, server)
```

Run the packaged example with `shiny::runApp(system.file("examples", package = "shinyHierarchy"))`.

The same component works with arbitrary levels, for example
`c("country", "department", "city")` or
`c("category", "subcategory", "product")`. Search is disabled by default and
can be enabled with `search = TRUE` for large hierarchies.

## Security

Values received through `input$...` are controlled by the browser. Validate
selected ids against the server-side hierarchy and user permissions before
using them to access sensitive data. Component dimensions accept only safe CSS
lengths such as `"350px"`, `"100%"`, or `"20rem"`.
