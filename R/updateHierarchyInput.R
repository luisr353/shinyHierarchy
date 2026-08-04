#' Change the value of a hierarchy input on the client
#'
#' @param session The `session` object passed to function given to `shinyServer`.
#'   Default is `getDefaultReactiveDomain()`.
#' @param inputId The id of the input object.
#' @param label The label to set for the input object.
#' @param choices A nested list representing the hierarchy.
#' @param selected The selected node id(s).
#'
#' @export
updateHierarchyInput <- function(session = shiny::getDefaultReactiveDomain(),
                                 inputId,
                                 label = NULL,
                                 choices = NULL,
                                 selected = NULL) {
  message <- dropNulls(list(
    label = label,
    choices = if (!is.null(choices)) jsonlite::toJSON(choices, auto_unbox = TRUE),
    selected = if (!is.null(selected)) jsonlite::toJSON(selected, auto_unbox = TRUE, null = "null")
  ))

  session$sendInputMessage(inputId, message)
}
