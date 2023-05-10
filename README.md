# website

## read this if u dont know where to start
hello friend. do u need to edit the website now? no problem. let's step through the process!

here are the essential tools you will need:
1. terminal
2. text editor

first, you will need to know where the folder containing the website files is.

then, you will need to know how to open this folder in your terminal, and your text editor.

great! now you can view and use the folders in the website folder!.

There are now two major things that you probably would do when editing the website:
1. add a page to the website
2. add stills to that page if it is a film

to add a page to the website, open the `site.md` file (in the website folder) in ur text editor and then edit it appropriately.

after adding the film by editing `site.md` appropriately i would recommend that you now run the command `./run.sh` in order to regenerate the entire website.

(slightly important note: if you get a message like `zsh: permission denied: ./run.sh`, you can likely resolve the problem by running `chmod +x run.sh`. this goes for other files that u run like `tool.js`. i would recommend running `chmod +x *.js *.sh` to quickly resolve all these problems [this makes all `.js` and all `.sh` files 'executable'.]).

after you regenerated the site by running `./run.sh` in the website folder, you can verify that the site actually changed by viewing a locally-hosted copy of the website. you can do this by
1. running `./tool.js host_local`
2. navigating to whereever it says it is locally hosting the website thing -- it should be `http://localhost:8000/`.
3. navigate to whatever page u just created and verify that it is there and stuff.
	- Please Look At The URL Thing Of It And Note It. I Will CAll This The "ID" Of A Page. For Example The ID Of "Me and My Babysitter" Is `me-and-my-babysitter` (you can verify this by going to the me and my babysitter page and seeing that the url is `http://localhost:8000/me-and-my-babysitter`).
4. Now If YOu Want you can stop the local web server by press control+c in the terminal. because otherwise you can't really continue on, unless you open a new terminal and continue from there, which is also a great option!.

Congratulations Now YOu Created the page! Now all you Need To Do Probably Is Add Stills To The Page If It Is A Film.

To Do this, You Need To Make A New Folder Underneath `./docs/media/` That Is Named The ID Of Your Film. That is, Within the website Folder There Is A folder called `docs` and in that `docs` folder there is a folder called `media`. and in that `media` folder u must create a new folder that is exactly named the ID of the film. For Example If i was adding stills for Me And My Babysitter i would create `me-and-my-babysitter` within `./docs/media`.

Great Now YOu Have a folder TO PUt your stills in. Now, Put The Stills Inside The Folder. it does not really matter what type of image file they are at this point because i recommend that you use `./tool.js` to convert them all to webp anyways (more on this in a bit) [note: if u use some image format that is not recognised by `tool.js` u may need to edit `tool.js` which may be tricky But oops. right now at least webp, jpg, png should all be fine.].

OK Now you made your folder. And you put unprocessed stills into it. Now, I Recommend: RENAME THE STILLS TO NUMERIC FILE NAMES. Currently the order that the stills is displayed on the website is by numeric file name order. So Please Rename all files to integers, e.g. `1.jpg`, `2.jpg`, `123.jpg`, etc. TO FACILITATE THIS PROCESS it may be helpful to use `./tool.js rename_stills` which does exactly this. It Will rename all the stills that is not numeric name to a numeric name.

- ALSO, IF YOU WANT TO REORDER THE STILLS, `./tool.js rename_stills` RENAMES EVERYTHING TO INTEGER NUMERIC NAMES WHILE TRYING TO MAINTAIN THE (potentially non-integer) NUMERIC NAMES OF THE ORIGINAL FILE NAMES. SO IF YOU HAVE E.G. `1.jpg`, `2.jpg`, AND `3.jpg` AND YOU WANT TO MOVE `3.jpg` TO THE MIDDLE (BETWEEN 	`1.jpg` and `2.jpg`), YOU CAN RENAME `3.jpg` TO A NUMERIC VALUE BETWEEN 1 AND 2, E.G. `1.5.jpg` OR `1.4.jpg` OR WHATEVER ELSE AND RUN `./tool.js rename_stills` AND IT WILL RENORMALIZE EVERYTHING TO `1.jpg`, `2.jpg`, AND `3.jpg` (WHERE NOW `2.jpg` is the old `3.jpg` and `3.jpg` is the new `2.jpg`). see the section on `./tool.js rename_stills` for maybe more detail.

great now u have STILLS THAT ARE NUMERICALLY NAMED IN A FOLDER NAMED THE ID OF THE PAGE. ok now the only thing i would recommend to do is CONVERT EVERYTHING TO `.webp` and then u are basically done.

ok to CONVERT EVERYTHING TO `.webp` all u need to do now is run `./tool.js stills2webp` and you should be good. ok. now if you list all the files in the id-named folder e.g. by running `ls docs/media/<id of film>` u should see everything is numeric and also webp. ok cool!

now the only thing left to do is regenerate the website which will add the stills to the website. just run `./run.sh` (in the website folder). great now it should now all work!! verify that it works by locally hosting again (if u closed web server from before.) by using the same steps from earlier, i.e.

1. running `./tool.js host_local` (in website folder)
2. navigating to whereever it says it is locally hosting the website thing -- it should be `http://localhost:8000/`.
3. make sure everything works

if something looks off just edit it and regenerate website and make sure it works and stuff!!

ok actually there is one final last step in order to push ur changes to git hub!! and that step is: push ur changes to git hub. yes to do this you will need to do this:

1. `git add .` ('stages' all the files)
2. `git commit -m 'your message here'` ('commits' any changes u have made to the files)
3. `git push origin main` (pushes the commit thing u just made)

thats it hopefully!🙂 the end.

## things need to install

- text editor
- deno (javascript runtime)
- pandoc (document transformation tool thing)
- imagemagick (for image conversion [via `./tool.js convert_to_webp`])

if you have none of these i would recommend taking the following steps:

1. install text editor
2. install homebrew (mac package manager thing)
3. run `brew install deno pandoc imagemagick` to install the rest
	- note: I have never actually ran this exact command so I am not sure if it will actually work properly. I also don't know if the package names will randomly change in the near future (though I doubt they will?).

## how to set up ssh keys for github authenitcation!!!!

1. run `ssh-keygen` and then press enter thru stuff u rlly dont need extra password stuff imo and idk how it rlly works

2. copy the contents of um like i think um `~/.ssh/id_rsa.pub` ? or similarly generated thing into github key settings.

3. actually maybe looking up how to do this on google is a better strategy

## how to generate the website after changing things

1. you can (re)generate the website with any changes you have changed by running `./run.sh`

2. you can host a local version of the website with `./tool.js host_local`

## how to add film

1. open `site.md`
2. add film and medium and description followig same format as other ones

### how to add stills to film page thing

each film has a short code thing based on its title. for example `1:11 film` the code is `111-film`

you can see exactly what short code a film has by browsing to its generated page and looking at its url.

1. go to `docs/media/<code>` (e.g. `docs/media/111-film`)
	- you will likely have to make the folder yourself if it is not already there
2. copy any pictures you like into it
	- note: the site will display the stills based on numeric file names, so make sure that your file names are numbers!! (e.g. `1.webp`, `2.webp`, etc.)
		- see `./tool.js rename_stills` for helpful renaming tips!!
		- i would recommend converting everything to `webp` files for optimal compression and stuff. see `./tool.js stills2webp` for helpful tool thing!
3. regenerate website (by running `./run.sh`) and you are done!!

## how to push changes to github

after you have made some changes to website and regenerated it how can you push these local changes to github??

1. it might be helpful to run `git status` and see what you have changed to make sure nothing looks strange.
2. run `git add .` to 'stage' all files
3. run `git commit -m "my change"` to commit these changes into a commit
4. run `git push origin main` to push commit to github 🙂. the end!

## `./tool.js`

this is a tool with helpful things for modifying website!!

### `./tool.js clean`
deletes all files that are generated by `./run.sh`

### `./tool.js host_local`
runs local web server that hosts `docs/`

### `./tool.js rename_stills`
this will numerify all stills to follow the naming convention `1`, `2`, `3`, etc.

it numerifies them based on their current numeric values and also puts non-numeric values at the end of the current scheme.

for example if you have the following files (in `docs/media/`):

```
111-film/1.jpg
111-film/2.webp
111-film/2.5.webp
111-film/3.jpg
111-film/08.jpg
111-film/hello.png
```

`./tool.js rename_stills` will try to rename them as follows:

```
111-film/1.jpg     ==> 111-film/1.jpg
111-film/2.webp    ==> 111-film/2.webp
111-film/2.5.webp  ==> 111-film/3.webp
111-film/3.jpg     ==> 111-film/4.jpg
111-film/08.jpg    ==> 111-film/5.jpg
111-film/hello.png ==> 111-film/6.png
```

### `./tool.js stills2webp`

converts stills to webp. i think webp is current web standard for photos. cool!

note: uses imagemagick's `convert` so make sure you have imagemagick!!
