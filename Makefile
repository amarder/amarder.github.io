clean:
	mv public/.git _temp
	rm -r public
	mkdir public
	mv _temp public/.git

deploy: clean
	hugo
	cd public; git add -A
	cd public; git commit -m "site updated"
	cd public; git push origin master

serve:
	hugo server --watch
