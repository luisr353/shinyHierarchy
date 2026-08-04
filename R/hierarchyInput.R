#' Create a hierarchy input control
#'
#' Creates a hierarchical tree input that allows users to navigate and select
#' nodes from a nested data structure.
#'
#' @param inputId The `input` slot that will be used to access the value.
#' @param label Display label for the control, or `NULL` for no label.
#' @param choices A nested list representing the hierarchy. Each node may
#'   contain `id`, `label`, and optional `children`.
#' @param selected The initially selected node id(s).
#' @param multiple Whether multiple selections are allowed. Defaults to `FALSE`.
#' @param width The width of the input (e.g. `'100%'`, `'400px'`).
#'
#' @return A Shiny UI tag that can be included in a UI definition.
#'
#' @export
#'
#' @examples
#' if (interactive()) {
#'   library(shiny)
#'   library(shinyHierarchy)
#'
#'   choices <- list(
#'     list(
#'       id = "a",
#'       label = "Group A",
#'       children = list(
#'         list(id = "a1", label = "Item A1"),
#'         list(id = "a2", label = "Item A2")
#'       )
#'     ),
#'     list(id = "b", label = "Group B")
#'   )
#'
#'   ui <- fluidPage(
#'     hierarchyInput("tree", "Select a node", choices)
#'   )
#'
#'   server <- function(input, output, session) {
#'     observe(print(input$tree))
#'   }
#'
#'   shinyApp(ui, server)
#' }
hierarchyInput <- function(inputId,
                           label = NULL,
                           choices = list(),
                           selected = NULL,
                           multiple = FALSE,
                           width = NULL) {
  selected <- shiny::restoreInput(id = inputId, default = selected)

  htmltools::attachDependencies(
    htmltools::tags$div(
      id = inputId,
      class = "shiny-hierarchy-input form-group",
      style = if (!is.null(width)) htmltools::css(width = width),
      if (!is.null(label)) htmltools::tags$label(label, class = "control-label", `for` = inputId),
      htmltools::tags$div(
        class = "hierarchy-container",
        `data-choices` = as.character(jsonlite::toJSON(choices, auto_unbox = TRUE)),
        `data-selected` = as.character(jsonlite::toJSON(selected, auto_unbox = TRUE, null = "null")),
        `data-multiple` = tolower(as.character(multiple))
      )
    ),
    hierarchyDependency()
  )
}
