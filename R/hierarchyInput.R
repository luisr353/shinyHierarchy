#' Hierarchical tree input for Shiny
#'
#' Creates a hierarchical slicer-style input similar to a Power BI date
#' hierarchy. The input value is a structured object (schema version 1) with
#' `resolved`, `rollup`, `explicit`, and `summary` fields.
#'
#' @param inputId The input slot that will be used to access the value.
#' @param label Optional label displayed above the component.
#' @param data A data frame containing the hierarchy columns.
#' @param levels Character vector with column names, ordered from highest
#'   to lowest hierarchy level.
#' @param selected Optional character vector of node ids to select initially.
#' @param expanded Optional character vector of node ids to expand initially.
#' @param placeholder Text shown when nothing is selected.
#' @param display Visual presentation: `"inline"` keeps the tree visible,
#'   while `"dropdown"` opens it in a floating panel.
#' @param search Whether to show a search box above the tree.
#' @param searchPlaceholder Placeholder for the search field.
#' @param selectAll Whether to show the select-all row.
#' @param selectAllLabel Label for the select-all control.
#' @param expand Initial expansion mode: first level, all levels, or none.
#' @param width CSS width of the component.
#' @param height CSS max-height of the tree area.
#'
#' @details
#' The value received from the browser is user-controlled and must not be used
#' as an authorization mechanism. Applications that filter sensitive data must
#' validate selected ids against the server-side hierarchy and permissions.
#'
#' @return A Shiny HTML object.
#' @export
hierarchyInput <- function(
  inputId,
  label = NULL,
  data,
  levels,
  selected = NULL,
  expanded = NULL,
  placeholder = "Selecci\u00f3n m\u00faltiple",
  display = c("inline", "dropdown"),
  search = FALSE,
  searchPlaceholder = "Buscar...",
  selectAll = TRUE,
  selectAllLabel = "Seleccionar todo",
  expand = c("first", "all", "none"),
  width = "100%",
  height = "360px"
) {
  if (!is.character(inputId) || length(inputId) != 1L) {
    stop("`inputId` must be a single character value.", call. = FALSE)
  }

  display <- match.arg(display)
  expand <- match.arg(expand)
  width <- validate_css_dimension(width, "width")
  height <- validate_css_dimension(height, "height")
  tree <- buildHierarchyTree(data, levels)

  config <- list(
    levels = as.list(levels),
    placeholder = placeholder,
    display = display,
    search = isTRUE(search),
    searchPlaceholder = searchPlaceholder,
    selectAll = isTRUE(selectAll),
    selectAllLabel = selectAllLabel,
    expand = expand,
    selected = as.character(selected %||% character()),
    expanded = as.character(expanded %||% character())
  )

  tree_json <- escape_json_for_html(
    jsonlite::toJSON(
      tree,
      auto_unbox = TRUE,
      dataframe = "rows",
      null = "null"
    )
  )

  config_json <- escape_json_for_html(
    jsonlite::toJSON(
      config,
      auto_unbox = TRUE,
      null = "null"
    )
  )

  container <- htmltools::tagList(
    if (!is.null(label)) {
      htmltools::tags$label(
        class = "shiny-hierarchy-label",
        `for` = paste0(inputId, "-trigger"),
        label
      )
    },
    htmltools::tags$div(
      id = inputId,
      class = "shiny-hierarchy-input",
      style = paste0(
        "width:", width, ";",
        "--sh-hierarchy-panel-max-height:", height, ";"
      ),
      htmltools::tags$script(
        type = "application/json",
        class = "shiny-hierarchy-config",
        htmltools::HTML(config_json)
      ),
      htmltools::tags$script(
        type = "application/json",
        class = "shiny-hierarchy-tree-data",
        htmltools::HTML(tree_json)
      ),
      htmltools::tags$div(class = "shiny-hierarchy-tree")
    )
  )

  htmltools::attachDependencies(
    container,
    shiny::singleton(hierarchy_dependency())
  )
}
