test_that("hierarchyInput renders config and tree payloads", {
  data <- data.frame(
    year = 2026,
    month = "January",
    day = 1
  )

  html <- as.character(
    hierarchyInput(
      "tree",
      "Date",
      data,
      c("year", "month", "day")
    )
  )

  expect_match(html, "shiny-hierarchy-input")
  expect_match(html, "shiny-hierarchy-config")
  expect_match(html, "shiny-hierarchy-tree-data")
  expect_match(html, "2026::January::1")
  expect_match(html, '"display":"inline"', fixed = TRUE)
  expect_match(html, '"search":false', fixed = TRUE)
  expect_match(html, '"selectAll":true', fixed = TRUE)
  expect_match(html, "--sh-hierarchy-panel-max-height:360px")
})

test_that("hierarchyInput accepts generic levels and display options", {
  data <- data.frame(
    country = "Colombia",
    department = "Antioquia",
    city = "Medellín"
  )

  html <- as.character(
    hierarchyInput(
      "places",
      "Location",
      data,
      c("country", "department", "city"),
      display = "dropdown",
      search = TRUE,
      selectAll = FALSE,
      expand = "none"
    )
  )

  expect_match(html, '"display":"dropdown"', fixed = TRUE)
  expect_match(html, '"search":true', fixed = TRUE)
  expect_match(html, '"selectAll":false', fixed = TRUE)
  expect_match(html, '"expand":"none"', fixed = TRUE)
})

test_that("hierarchyInput validates display and expansion modes", {
  data <- data.frame(a = "x")

  expect_error(
    hierarchyInput("tree", data = data, levels = "a", display = "modal"),
    "should be one"
  )
  expect_error(
    hierarchyInput("tree", data = data, levels = "a", expand = "some"),
    "should be one"
  )
})

test_that("embedded JSON cannot close its script element", {
  attack <- "</script><script>window.pwned=true</script>"
  data <- data.frame(category = attack)

  html <- as.character(
    hierarchyInput(
      "tree",
      data = data,
      levels = "category",
      placeholder = attack
    )
  )

  expect_false(grepl(attack, html, fixed = TRUE))
  expect_false(
    grepl("</script><script>window.pwned", html, fixed = TRUE)
  )
  expect_match(html, "\\u003c\\/script", fixed = TRUE)

  encoded <- shinyHierarchy:::escape_json_for_html(
    jsonlite::toJSON(list(value = attack), auto_unbox = TRUE)
  )
  expect_equal(
    jsonlite::fromJSON(encoded)$value,
    attack
  )
})

test_that("width and height reject unsafe CSS values", {
  data <- data.frame(category = "Safe")

  expect_error(
    hierarchyInput(
      "tree",
      data = data,
      levels = "category",
      width = '100%" onmouseover="alert(1)'
    ),
    "safe CSS dimension"
  )
  expect_error(
    hierarchyInput(
      "tree",
      data = data,
      levels = "category",
      height = "360px;position:fixed"
    ),
    "safe CSS dimension"
  )
  expect_silent(
    hierarchyInput(
      "tree",
      data = data,
      levels = "category",
      width = "24rem",
      height = 400
    )
  )
})

test_that("updateHierarchyInput validates data and levels", {
  expect_error(
    updateHierarchyInput(
      session = list(
        sendInputMessage = function(inputId, message) {
          invisible(NULL)
        }
      ),
      inputId = "tree",
      data = data.frame(x = 1)
    ),
    "levels"
  )
})
