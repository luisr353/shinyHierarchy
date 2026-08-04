test_that("hierarchyInput returns a shiny tag with expected class", {
  tag <- hierarchyInput("tree", "Label", choices = list(list(id = "a", label = "A")))
  html <- as.character(tag)

  expect_true(inherits(tag, "shiny.tag") || inherits(tag, "shiny.tag.list") || inherits(tag, "html"))
  expect_match(html, "shiny-hierarchy-input")
  expect_match(html, "hierarchy-container")
  expect_match(html, 'id="tree"')
})

test_that("dropNulls removes NULL values", {
  expect_equal(
    shinyHierarchy:::dropNulls(list(a = 1, b = NULL, c = "x")),
    list(a = 1, c = "x")
  )
})
