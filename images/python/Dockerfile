# DOCKER-VERSION 0.4.0

from ubuntu:12.04
run apt-get -y update
run apt-get -y install python-software-properties curl

# Install python 3.3
run add-apt-repository ppa:fkrull/deadsnakes
run apt-get -y update
run apt-get -y install python3.3

# Set workdir
workdir /home

# Install pip
run curl https://bitbucket.org/pypa/setuptools/raw/bootstrap/ez_setup.py | python3.3
run curl https://raw.github.com/pypa/pip/master/contrib/get-pip.py | python3.3
