# Curb Signs Website

This repository hosts the source for the **Curb Signs** marketing site. The project is configured as a [GitHub Pages](https://pages.github.com/) site powered by [Jekyll](https://jekyllrb.com/).

## Local development

1. Install Ruby (3.1 or newer is recommended).
2. Install the dependencies:
   ```bash
   bundle install
   ```
3. Run the development server:
   ```bash
   bundle exec jekyll serve
   ```
4. Visit the site at <http://localhost:4000>.

## Deployment

GitHub Pages will automatically build and deploy the site whenever changes are
pushed to the default `master` branch. No additional build steps are required.
If you are working from another branch, merge or fast-forward your work on to
`master` and push that branch to trigger an updated deployment.
