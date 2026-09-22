# Internal utilities for shinyHierarchy.

`%||%` <- function(x, y) {
  if (is.null(x)) y else x
}

hierarchy_dependency <- function() {
  htmltools::htmlDependency(
    name = "shinyHierarchy",
    version = utils::packageVersion("shinyHierarchy"),
    src = "www",
    package = "shinyHierarchy",
    script = c("hierarchy-model.js", "hierarchy.js", "hierarchy-binding.js"),
    stylesheet = "hierarchy.css"
  )
}

value_type_of <- function(x) {
  if (is.integer(x)) {
    return("integer")
  }
  if (is.numeric(x)) {
    return("double")
  }
  if (is.logical(x)) {
    return("logical")
  }
  "character"
}

escape_json_for_html <- function(json) {
  json <- gsub("&", "\\u0026", json, fixed = TRUE)
  json <- gsub("<", "\\u003c", json, fixed = TRUE)
  gsub(">", "\\u003e", json, fixed = TRUE)
}

validate_css_dimension <- function(value, argument) {
  if (
    is.numeric(value) &&
      length(value) == 1L &&
      !is.na(value) &&
      is.finite(value) &&
      value >= 0
  ) {
    return(paste0(value, "px"))
  }

  valid_pattern <- paste0(
    "^(auto|0|",
    "(?:[0-9]+(?:\\.[0-9]+)?|\\.[0-9]+)",
    "(?:px|%|em|rem|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc))$"
  )

  if (
    !is.character(value) ||
      length(value) != 1L ||
      is.na(value) ||
      !grepl(valid_pattern, value, perl = TRUE)
  ) {
    stop(
      "`", argument, "` must be a safe CSS dimension, such as ",
      "`350px`, `100%`, `20rem`, or `auto`.",
      call. = FALSE
    )
  }

  value
}
