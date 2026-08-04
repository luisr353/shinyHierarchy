<!-- README.md is generated from README.Rmd. Please edit that file -->

# shinyHierarchy

<!-- badges: start -->
<!-- badges: end -->

Custom Shiny input for navigating and selecting values from hierarchical data structures.

## Installation

You can install the development version of shinyHierarchy from a local clone:

``` r
# install.packages("devtools")
devtools::install(".")
```

## Example

``` r
library(shiny)
library(shinyHierarchy)

choices <- list(
  list(
    id = "a",
    label = "Group A",
    children = list(
      list(id = "a1", label = "Item A1"),
      list(id = "a2", label = "Item A2")
    )
  ),
  list(id = "b", label = "Group B")
)

ui <- fluidPage(
  hierarchyInput("tree", "Select a node", choices),
  verbatimTextOutput("value")
)

server <- function(input, output, session) {
  output$value <- renderPrint(input$tree)
}

shinyApp(ui, server)
```

## Development

``` r
devtools::load_all()
devtools::document()
devtools::test()
devtools::check()
```
