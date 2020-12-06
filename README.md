# Working Week

Simple node/typescript app providing an API for getting working days for a week: [working-week.herokuapp.com](https://working-week.herokuapp.com), based on [express-generator-typescript](https://www.npmjs.com/package/express-generator-typescript).


### `GET /working-week/:date?region=:region`

`date` a string parsable as a date

`region` a region of the uk from the following; 'england-and-wales', 'scotland', 'northern-ireland'. Defaults to 'england-and-wales' if not provided.

Returns an an object containing an array of dates for the working days in the week commencing on the Monday following the date provided.


### Setup

- clone the repo

```
$ git clone git@github.com:sauntimo/working-week.git working-week
```

- initialise

```
$ cd working-week && npm i && npm run start:dev
```

![image](https://user-images.githubusercontent.com/2720466/101290916-eb115500-37fc-11eb-9d3a-1a44102b82b8.png)

### Local Usage

- make a request to the API - json pretty printing with python assumes you have python installed.
```
$ curl -s 'localhost:3000/working-week/2020-12-18?region=england-and-wales'| python -m json.tool
```

![image](https://user-images.githubusercontent.com/2720466/101290974-4c392880-37fd-11eb-996a-1ea92601d925.png)

- use the local frontend - [localhost:3000/](http://localhost:3000/)

![image](https://user-images.githubusercontent.com/2720466/101291035-d6818c80-37fd-11eb-9db2-f00c74974e9b.png)

### Hosted Usage

- the app is deployed on heroku so you can call the API there
```
$ curl -s 'https://working-week.herokuapp.com/working-week/2020-12-18?region=england-and-wales' | python -m json.tool
```

![image](https://user-images.githubusercontent.com/2720466/101291083-2ceecb00-37fe-11eb-86a2-c25edf0a08a3.png)

- a similar frontend is also available at [working-week.herokuapp.com](https://working-week.herokuapp.com).
