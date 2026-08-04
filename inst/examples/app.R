library(shiny)

# Cargar el paquete en desarrollo (ejecutar desde la raíz del paquete:
# shiny::runApp("inst/examples/app.R"))
pkg_root <- if (file.exists("DESCRIPTION")) {
  getwd()
} else {
  normalizePath(file.path(getwd(), "../.."))
}
pkgload::load_all(pkg_root)

choices <- list(
  list(
    id = "america",
    label = "América",
    children = list(
      list(
        id = "norte",
        label = "Norteamérica",
        children = list(
          list(id = "mx", label = "México"),
          list(id = "us", label = "Estados Unidos"),
          list(id = "ca", label = "Canadá")
        )
      ),
      list(
        id = "sur",
        label = "Sudamérica",
        children = list(
          list(id = "br", label = "Brasil"),
          list(id = "ar", label = "Argentina"),
          list(id = "co", label = "Colombia")
        )
      )
    )
  ),
  list(
    id = "europa",
    label = "Europa",
    children = list(
      list(id = "es", label = "España"),
      list(id = "fr", label = "Francia"),
      list(id = "de", label = "Alemania")
    )
  )
)

ui <- fluidPage(
  titlePanel("shinyHierarchy — demo"),
  sidebarLayout(
    sidebarPanel(
      hierarchyInput(
        inputId = "tree",
        label = "Selecciona un nodo",
        choices = choices,
        selected = "mx",
        width = "100%"
      ),
      actionButton("select_es", "Seleccionar España"),
      actionButton("reset", "Limpiar selección")
    ),
    mainPanel(
      h4("Valor seleccionado"),
      verbatimTextOutput("value")
    )
  )
)

server <- function(input, output, session) {
  output$value <- renderPrint({
    input$tree
  })

  observeEvent(input$select_es, {
    updateHierarchyInput(session, "tree", selected = "es")
  })

  observeEvent(input$reset, {
    updateHierarchyInput(session, "tree", selected = character(0))
  })
}

shinyApp(ui, server)
