+++
date = "2017-06-14T18:12:13+01:00"
draft = true
tags = ["blog"]
title = "A Hugo / Heroku workflow for hosting static websites"

+++

[Hugo](https://gohugo.io) is a "fast and modern" static site generator that has been gaining some steam lately. It is an alternative to other generators such as [Jekyll](http://jekyllrb.com/) or [Hexo](https://hexo.io/). Built using Google's Golang, it is highly performant and portable. <!--more-->

I have recently used Hugo to rebuild my personal website and have had a fantastic experience with it in combination with Heroku. The workflow for updating my website content is now as follows:

* Make changes to content
* Push to Heroku

That's it, my website is now updated. It's magical.

#### Why use a static site generator?

Speed and simplicity, most websites we encounter online generate the HTML we view dynamically on a per request basis, our page load times become coupled with the speed of our website backend. If our website is "static" nothing needs to be generated per request allowing our web server to go as fast as it is capable of serving the files.

For many sites such as a blog or brand website, we do not need to generate dynamic content every request as the content doesn't change. If you would like a more in-depth argument for it, I recommend reading [Why Static Site Generators Are The Next Big Thing](https://www.smashingmagazine.com/2015/11/modern-static-website-generators-next-big-thing/) as they do a much better job than I.

#### How does Hugo work?

At a basic level, a Hugo page is generated using a combination of a HTML template and a Markdown file for the content. Templates are provided by "themes", there are many to select from on [https://themes.gohugo.io/](https://themes.gohugo.io/) or you can create one yourself. For the purposes of this blog post we will be using a premade theme for simplicity.

When you run the command to build Hugo it iterates through all of your content and generates html pages from the theme templates. The end result will be a "public" folder which encapsulates your entire site. This is the folder that will then be hosted by a web server of your choice.

#### Installing Hugo

You can download the lastest release of Hugo for your architecture from [Github](https://github.com/gohugoio/hugo/releases), alternatively if you are using OSX you can use homebrew.

```bash
brew install hugo
```

Once installed, I highly recommend that you read through the basic tutorial located here: 