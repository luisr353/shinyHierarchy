#' HTML dependency for shinyHierarchy
#'
#' @noRd
hierarchyDependency <- function() {
  htmltools::htmlDependency(
    name = "shinyHierarchy",
    version = "0.1.0",
    src = "www",
    package = "shinyHierarchy",
    script = c("hierarchy.js", "hierarchy-binding.js"),
    stylesheet = "hierarchy.css"
  )
}

#' Drop NULL elements from a list
#'
#' @param x A list.
#' @return A list without NULL elements.
#' @noRd
dropNulls <- function(x) {
  x[!vapply(x, is.null, logical(1))]
}
