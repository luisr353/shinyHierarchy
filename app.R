library(shiny)
library(shinyHierarchy)

df <- data.frame(
  year = c(2026, 2026, 2026, 2025, 2025),
  month = c(
    "January",
    "January",
    "February",
    "December",
    "December"
  ),
  day = c(
    1,
    2,
    1,
    30,
    31
  )
)

ui <- fluidPage(
  h2("shinyHierarchy - MVP"),
  hierarchyInput(
    inputId = "date_hierarchy",
    label = "Fecha",
    data = df,
    levels = c("year", "month", "day"),
    width = "350px",
    height = "350px"
  )
)

server <- function(input, output, session) {
  observeEvent(input$date_hierarchy, {
    print(
      vapply(
        hierarchyResolved(input$date_hierarchy),
        function(x) x$id,
        character(1)
      )
    )
  }, ignoreInit = TRUE)
}

shinyApp(ui, server)
