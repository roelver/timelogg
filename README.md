## Timelogg

A simple time logger, made in Angular 4.
Features:
* Add tasks per day
* Record time logs in realtime
* Add logs manually 
* Get a summary
* Copy tasks from previous days
* Scroll through the past few days.

Go to the [DEMO](https://timelogg.herokuapp.com) for this app is available on Heroku.


## Heroku

### Create a Heroku app first (if you don't have already one)

```
heroku create --region eu timelogg
```

### Create a remote for heroku if it does not exits yet (if you don't have already one)

```
heroku git:remote -a timelogg
```
### Add MongoDB

You can use a free plan of [MongoLab](https://elements.heroku.com/addons/mongolab) for data storage:

```
heroku addons:create mongolab:sandbox
```

### Deploy

```
git push heroku master
```

### Open Heroku app in browser

```
heroku open
```

