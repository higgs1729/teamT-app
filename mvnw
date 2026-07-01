#!/bin/sh
# ----------------------------------------------------------------------------
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements. See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership. The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License. You may obtain a copy of the License at
#
#    https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied. See the License for the
# specific language governing permissions and limitations
# under the License.
# ----------------------------------------------------------------------------

# ----------------------------------------------------------------------------
# Apache Maven Wrapper startup batch script, version 3.2.0
# ----------------------------------------------------------------------------

#!/bin/sh
set -e

# Find the project base dir, i.e. the directory that contains the folder ".mvn".
find_maven_basedir() {
  BASEDIR=$(dirname "$0")
  BASEDIR=$(cd "$BASEDIR" && pwd)
  WDIR=$BASEDIR
  while [ "$WDIR" != '/' ] ; do
    if [ -d "$WDIR/.mvn" ] ; then
      BASEDIR=$WDIR
      break
    fi
    WDIR=$(dirname "$WDIR")
  done
  echo "$BASEDIR"
}

BASE_DIR=$(find_maven_basedir)
MAVEN_PROJECTBASEDIR="${BASE_DIR}"
export MAVEN_PROJECTBASEDIR

MAVEN_WRAPPER_JAR="$MAVEN_PROJECTBASEDIR/.mvn/wrapper/maven-wrapper.jar"
MAVEN_WRAPPER_PROPERTIES="$MAVEN_PROJECTBASEDIR/.mvn/wrapper/maven-wrapper.properties"

if [ -r "$MAVEN_WRAPPER_PROPERTIES" ]; then
  . "$MAVEN_WRAPPER_PROPERTIES"
fi

# If maven-wrapper.jar is not available, download it
if [ ! -e "$MAVEN_WRAPPER_JAR" ]; then
  if command -v wget > /dev/null; then
    wget "$wrapperUrl" -O "$MAVEN_WRAPPER_JAR" 2>/dev/null
  elif command -v curl > /dev/null; then
    curl -o "$MAVEN_WRAPPER_JAR" "$wrapperUrl" 2>/dev/null
  fi
fi

exec "$JAVA_HOME/bin/java" \
  -classpath "$MAVEN_WRAPPER_JAR" \
  "-Dmaven.multiModuleProjectDirectory=$MAVEN_PROJECTBASEDIR" \
  org.apache.maven.wrapper.MavenWrapperMain "$@"
