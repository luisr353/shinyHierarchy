test_that("hierarchy helpers read structured values", {
  value <- list(
    schema_version = 1,
    resolved = list(
      list(
        id = "2026::January::1",
        path = list(
          list(levelName = "year", value = 2026),
          list(levelName = "month", value = "January"),
          list(levelName = "day", value = 1)
        )
      )
    ),
    rollup = list(
      list(id = "2026::January")
    )
  )

  expect_length(hierarchyResolved(value), 1)
  expect_equal(hierarchyRollup(value)[[1]]$id, "2026::January")
  expect_equal(
    hierarchyPath(value, "month"),
    "January"
  )
})

test_that("helpers tolerate NULL", {
  expect_length(hierarchyResolved(NULL), 0)
  expect_length(hierarchyRollup(NULL), 0)
  expect_length(hierarchyPath(NULL, "month"), 0)
})
