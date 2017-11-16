FROM centos:7

LABEL authors="Andres Anania <aanania@lsst.org>, Sebastian Pereira <sebastian.pereira@inria.cl>"

# install required software
RUN yum -y --enablerepo=extras install epel-release && \
  yum -y install gsl \
  yum -y install unzip \
  wget \
  git \
  dos2unix \
  tk \
  tk-devel \
  swig \
  ncurses-libs \
  xterm \
  xorg-x11-fonts-misc \
  java-1.8.0-openjdk-devel \
  boost-python \
  boost-python-devel \
  maven \
  python-devel \
  python-pip \
  python-wheel \
  nano && \
  yum clean all

RUN yum groupinstall -y "Development Tools" "Development Libraries" && \
  yum clean all

# environment variables section
ENV HOME=/home/root
ENV LSST_SDK_INSTALL=$HOME/workspace/ts_visit_simulator
ENV SAL_HOME=$LSST_SDK_INSTALL/lsstsal
ENV SAL_WORK_DIR=$LSST_SDK_INSTALL/test
ENV SAL_CPPFLAGS=-m64
ENV JAVA_HOME=/etc/alternatives/java_sdk_openjdk
ENV LD_LIBRARY_PATH=${SAL_HOME}/lib
ENV TCL_LIBRARY=${SAL_HOME}/lib/tcl8.5
ENV TK_LIBRARY=${SAL_HOME}/lib/tk8.5
ENV LD_PRELOAD=/etc/alternatives/java_sdk_openjdk/jre/lib/amd64/libjsig.so
ENV PATH=$JAVA_HOME/bin:${M2}:${SAL_HOME}/bin:${PATH}
ENV PYTHONPATH=$PYTHONPATH:${SAL_WORK_DIR}/lib
ENV SAL_DIR=${SAL_HOME}/scripts
ENV PATH=${PATH}:${SAL_DIR}
ENV OSPL_HOME=$LSST_SDK_INSTALL/OpenSpliceDDS/V6.4.1/HDE/x86_64.linux

COPY ./ts_visit_simulator /home/docker/workspace/ts_visit_simulator
COPY run.sh /home/docker/workspace/

COPY LSST-server/requirements.txt /home/docker/lsst/LSST-server/requirements.txt
RUN pip install -r /home/docker/lsst/LSST-server/requirements.txt
RUN wget -O /home/docker/lsst/LSST-server/circumpolar.db http://artifactory.inria.cl:8081/artifactory/generic-local/circumpolar.db 

RUN yum -y install nodejs

ADD LSST-app/package.json /home/docker/lsst/LSST-app/package.json

WORKDIR /home/docker/lsst/LSST-app

RUN npm install

COPY LSST-app /home/docker/lsst/LSST-app
COPY LSST-server /home/docker/lsst/LSST-server
COPY run.sh /home/docker/lsst/run.sh

RUN npm install

# entrypoint
RUN chmod +x run.sh
ENTRYPOINT source /home/docker/workspace/ts_visit_simulator/setup.env && \
  /home/docker/lsst/run.sh
