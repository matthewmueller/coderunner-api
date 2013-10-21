test:
	@./node_modules/.bin/mocha \
		--harmony-generators

testw:
	@./node_modules/.bin/mocha \
		--harmony-generators \
		--watch

mount:
	sshfs vagrant@127.0.0.1:/home/vagrant/coderunner-api /Volumes/coderunner-api \
		-o IdentityFile=~/.vagrant.d/insecure_private_key \
		-p $$(vagrant ssh-config | grep Port | sed 's/Port //')

images:
	@docker build -t node-runner images/node
	@docker build -t python-runner images/python

.PHONY: mount images test testw
