
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

