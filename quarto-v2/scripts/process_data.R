# Get URL suffix for all images

library(readr)
library(httr)
library(here)

serengeti <- read_csv(here::here("data", "Serengeti_Data_200_lines_modified.csv"))
url_suffix <- data.frame(
  CaptureEventID = serengeti$CaptureEventID,
  suffix = ''
)

for (row in 1:nrow(suffix)) {
  cap <- paste0("'%", url_suffix$CaptureEventID[row], "%'")
  r <- POST("https://searchserengeti.umn.edu//api/results.php", body = list(cap = cap), encode = "form")
  url <- jsonlite::fromJSON(content(r, 'text'))$imageData$url
  if (!is.null(url)) {
    tmp <- strsplit(url, '/')[[1]]
    url_suffix[row, 'suffix'] <- paste0(c(tmp[1], tmp[2], tmp[3], paste0(c(tmp[1], tmp[3], tmp[4]), collapse='_')), collapse = '/')
  }
}

write_csv(url_suffix, here::here("data", "url_suffix.csv"))
  
# r = POST("https://searchserengeti.umn.edu//api/results.php", body = list(cap = "'%ASG0002kjo%'"), encode = "form")
# jsonlite::fromJSON(content(r, 'text'))$imageData
