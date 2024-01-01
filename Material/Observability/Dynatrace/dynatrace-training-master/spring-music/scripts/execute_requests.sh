#!/usr/bin/env bash

URL=${1}
ITERATIONS=${2:-1}

PAYLOAD="{\"title\":\"Our Test Album\",\"artist\":\"Training\",\"releaseYear\":\"2019\",\"genre\":\"Rock\",\"trackCount\":0,\"albumId\":null}"

if [ -z "${URL}" ]; then
  echo "Please provide a URL to your spring-music app."
  exit 1
fi

for i in `seq 1 "${ITERATIONS}"`
do
    printf "Calling ${URL}/albums\n"
    curl --fail --silent "${URL}/albums" > /dev/null
    status=$?
    if [ $status -gt 0 ]; then
      printf "Getting albums failed.\n"
      exit $status
    fi

    printf "Creating a new album\n"
    payload=$(curl -X PUT --fail --silent "${URL}/albums" -d "${PAYLOAD}" -H "Content-Type: application/json")
    status=$?
    if [ $status -gt 0 ]; then
      printf "Creating album failed.\n"
      exit $status
    fi

    id=$(echo "$payload" | cut -d'"' -f 4 )

    printf "Getting the created album\n"
    curl -X GET --fail --silent "${URL}/albums/${id}" 1> /dev/null
    status=$?
    if [ $status -gt 0 ]; then
      printf "Getting album failed.\n"
      exit $status
    fi

    printf "Deleting the album\n"
    curl -X DELETE --fail --silent "${URL}/albums/${id}" 1> /dev/null
    status=$?
    if [ $status -gt 0 ]; then
      printf "Deleting album failed. Might be on other process instance.\n"
    fi

done