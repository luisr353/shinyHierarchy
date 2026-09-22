library(shiny)
library(shinyHierarchy)

df <- data.frame(
  year = c(2026, 2026, 2025),
  month = c("January", "February", "December"),
  day = c(1, 1, 31)
)

ui <- fluidPage(
  titlePanel("shinyHierarchy example"),
  hierarchyInput(
    inputId = "dates",
    label = "Year, Month, Day",
    data = df,
    levels = c("year", "month", "day"),
    selected = "2026::January::1",
    display = "inline",
    search = FALSE
  ),
  actionButton("clear", "Clear selection"),
  verbatimTextOutput("value")
)

server <- function(input, output, session) {
  output$value <- renderPrint({
    list(
      resolved = hierarchyResolved(input$dates),
      rollup = hierarchyRollup(input$dates)
    )
  })

  observeEvent(input$clear, {
    updateHierarchyInput(session, "dates", clear = TRUE)
  })
}

shinyApp(ui, server)
