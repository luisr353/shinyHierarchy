test_that("buildHierarchyTree creates a hierarchy with metadata", {
  data <- data.frame(
    year = c(2026, 2026, 2026),
    month = c("January", "January", "February"),
    day = c(1, 2, 1)
  )

  tree <- buildHierarchyTree(
    data,
    c("year", "month", "day")
  )

  expect_length(tree, 1)
  expect_equal(tree[[1]]$levelName, "year")
  expect_null(tree[[1]]$parentId)

  leaf <- tree[[1]]$children[[1]]$children[[1]]
  expect_equal(leaf$id, "2026::January::1")
  expect_equal(leaf$levelName, "day")
  expect_equal(leaf$parentId, "2026::January")
  expect_length(leaf$path, 3)
})

test_that("missing hierarchy columns produce an error", {
  data <- data.frame(year = 2026)

  expect_error(
    buildHierarchyTree(data, c("year", "month")),
    "missing"
  )
})

test_that("duplicate levels produce an error", {
  data <- data.frame(year = 2026, month = "Jan")

  expect_error(
    buildHierarchyTree(data, c("year", "year")),
    "duplicate"
  )
})

test_that("empty complete rows produce an empty tree", {
  data <- data.frame(
    year = c(NA, NA),
    month = c(NA, NA)
  )

  tree <- buildHierarchyTree(data, c("year", "month"))

  expect_length(tree, 0)
})
