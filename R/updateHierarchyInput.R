#' Update a hierarchical input from the server
#'
#' @param session Shiny session object.
#' @param inputId The input id to update.
#' @param data Optional new data frame.
#' @param levels Optional hierarchy column names (required if `data` is set).
#' @param selected Optional vector of node ids to select (cascades to descendants).
#' @param expanded Optional vector of node ids to expand.
#' @param clear If `TRUE`, clears the current selection.
#' @param open If `TRUE` or `FALSE`, opens or closes the dropdown panel.
#'
#' @return No useful return value, invisibly `NULL`.
#' @export
updateHierarchyInput <- function(
  session = shiny::getDefaultReactiveDomain(),
  inputId,
  data = NULL,
  levels = NULL,
  selected = NULL,
  expanded = NULL,
  clear = FALSE,
  open = NULL
) {
  message <- list()

  if (!is.null(data)) {
    if (is.null(levels)) {
      stop("`levels` must be supplied when `data` is supplied.", call. = FALSE)
    }

    tree <- buildHierarchyTree(data, levels)
    message$tree <- tree
    message$levels <- as.list(levels)
  }

  if (!is.null(selected)) {
    message$selected <- as.character(selected)
  }

  if (!is.null(expanded)) {
    message$expanded <- as.character(expanded)
  }

  if (isTRUE(clear)) {
    message$clear <- TRUE
  }

  if (!is.null(open)) {
    message$open <- isTRUE(open)
  }

  session$sendInputMessage(inputId, message)

  invisible(NULL)
}
