test:
	@./node_modules/.bin/mocha \
		--reporter spec \
		--timeout 10000 \
		--harmony-generators

testw:
	@./node_modules/.bin/mocha \
		--reporter spec \
		--harmony-generators \
		--timeout 10000 \
		--watch

mount:
	sshfs vagrant@localhost:/home/vagrant/coderunner-api /Volumes/coderunner-api \
		-o IdentityFile=~/.vagrant.d/insecure_private_key \
		-p $$(vagrant ssh-config | grep Port | sed 's/Port //')

images:
	@docker build -t node-runner images/node
	@docker build -t python-runner images/python

.PHONY: mount images test testw
