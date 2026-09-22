#' Build a hierarchical tree from tabular data
#'
#' Converts a data frame and an ordered set of columns into a nested
#' hierarchy suitable for the Shiny input component.
#'
#' @param data A data frame containing the hierarchy columns.
#' @param levels A character vector with column names, ordered from
#'   highest to lowest hierarchy level.
#' @return A list representing the hierarchy tree.
#' @export
#' @examples
#' data <- data.frame(
#'   year = c(2026, 2026, 2026),
#'   month = c("January", "January", "February"),
#'   day = c(1, 2, 1)
#' )
#' buildHierarchyTree(data, c("year", "month", "day"))
buildHierarchyTree <- function(data, levels) {
  if (!is.data.frame(data)) {
    stop("`data` must be a data.frame.", call. = FALSE)
  }

  if (!is.character(levels) || length(levels) == 0L) {
    stop("`levels` must be a non-empty character vector.", call. = FALSE)
  }

  if (anyDuplicated(levels)) {
    stop("`levels` must not contain duplicates.", call. = FALSE)
  }

  missing_levels <- setdiff(levels, names(data))
  if (length(missing_levels) > 0L) {
    stop(
      "The following hierarchy columns are missing from `data`: ",
      paste(missing_levels, collapse = ", "),
      call. = FALSE
    )
  }

  data <- data[, levels, drop = FALSE]
  data <- data[stats::complete.cases(data), , drop = FALSE]

  if (nrow(data) == 0L) {
    return(list())
  }

  escape_id_part <- function(x) {
    gsub("([\\\\/|:])", "\\\\\\1", as.character(x))
  }

  build_level <- function(
    rows,
    level_index,
    prefix_parts = character(),
    parent_id = NULL,
    path_values = list()
  ) {
    column <- levels[[level_index]]
    values <- unique(rows[[column]])

    lapply(seq_along(values), function(i) {
      value <- values[[i]]
      current <- rows[rows[[column]] == value, , drop = FALSE]

      part <- escape_id_part(value)
      id_parts <- c(prefix_parts, part)
      node_id <- paste(id_parts, collapse = "::")

      path <- c(
        path_values,
        list(
          list(
            level = level_index,
            levelName = column,
            value = value,
            id = node_id
          )
        )
      )

      node <- list(
        id = node_id,
        label = as.character(value),
        value = value,
        valueType = value_type_of(value),
        level = level_index,
        levelName = column,
        levelIndex = level_index,
        parentId = parent_id,
        path = path,
        expanded = level_index == 1L,
        children = list()
      )

      if (level_index < length(levels)) {
        node$children <- build_level(
          current,
          level_index + 1L,
          prefix_parts = id_parts,
          parent_id = node_id,
          path_values = path
        )
      }

      node
    })
  }

  build_level(data, 1L)
}
