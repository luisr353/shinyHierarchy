#' Extract resolved leaf selections from a hierarchy input value
#'
#' @param value Value returned by a hierarchy input (`input$...`).
#' @return A list of resolved node records, or an empty list.
#' @export
hierarchyResolved <- function(value) {
  if (is.null(value) || !is.list(value)) {
    return(list())
  }

  value$resolved %||% list()
}

#' Extract rollup selections from a hierarchy input value
#'
#' @param value Value returned by a hierarchy input (`input$...`).
#' @return A list of rollup node records, or an empty list.
#' @export
hierarchyRollup <- function(value) {
  if (is.null(value) || !is.list(value)) {
    return(list())
  }

  value$rollup %||% list()
}

#' Extract path values at a given hierarchy level
#'
#' @param value Value returned by a hierarchy input (`input$...`).
#' @param level_name Name of the hierarchy level column.
#' @return A character vector of unique values at that level among
#'   resolved selections.
#' @export
hierarchyPath <- function(value, level_name) {
  resolved <- hierarchyResolved(value)

  if (length(resolved) == 0L) {
    return(character())
  }

  values <- vapply(resolved, function(node) {
    path <- node$path
    if (is.null(path) || length(path) == 0L) {
      return(NA_character_)
    }

    for (entry in path) {
      if (!is.null(entry$levelName) && entry$levelName == level_name) {
        return(as.character(entry$value))
      }
    }

    NA_character_
  }, character(1))

  unique(stats::na.omit(values))
}
