#' @importFrom shiny registerInputHandler
.onLoad <- function(libname, pkgname) {
  registerInputHandler(
    "shinyHierarchy.value",
    function(data, ...) {
      if (is.null(data)) {
        return(NULL)
      }

      if (is.list(data)) {
        return(data)
      }

      jsonlite::fromJSON(data, simplifyVector = FALSE)
    },
    force = TRUE
  )
}
