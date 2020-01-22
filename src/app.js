const path = require('path')
const express = require('express')
const hbs = require('hbs')
const request=require('request');
const app = express()

const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../views')


app.set('view engine', 'hbs')
app.set('views', viewsPath)

app.use(express.static(publicDirectoryPath))


const forecast = (latitude, longitude, callback) => {
    const url = 'https://api.darksky.net/forecast/9e2b31a9b2f4d570737a48b492aa2417/' + latitude + ',' + longitude;

    request({ url, json: true }, (error, { body }) => {
        if (error) {
            callback('Unable to connect', undefined)
        } else if (body.error) {
            callback('Unable to find location', undefined)
        } else {
           callback(undefined, body.daily.data[0].summary + ' It is currently ' + body.currently.temperature + ' farhenheit out. There is a ' + body.currently.precipProbability + '% chance of rain.')
        }
    })
}


const geocode = (loc, callback) => {
    const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + loc + '.json?access_token=pk.eyJ1IjoicmFodWxwMzkxIiwiYSI6ImNrNThlNzNxeDA5eW8zZXBmbnN3eHV0OGMifQ.Iii9u8ygkDLjqFO8c-vzmQ&limit=1'

    request({ url, json: true }, (error, { body }) => {
        if (error) {
            callback('Unable to connect!', undefined)
        } else if (body.features.length === 0) {
            callback('Unable to find location.', undefined)
        } else {
            callback(undefined, {
                latitude: body.features[0].center[1],
                longitude: body.features[0].center[0],
                location: body.features[0].place_name
            })
        }
    })
}

app.get('', (req, res) => {
    res.render('index', {
        title: 'Weather',
        name: 'Rahul Pathania'
    })
})

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Me',
        name: 'Rahul Pathania'
    })
})

app.get('/help', (req, res) => {
    res.render('help', {
        helpText: 'Sorry cant help you right now.',
        title: 'Help',
        name: 'Rahul Pathania'
    })
})

app.get('/weather', (req, res) => {
    if (!req.query.address) {
        return res.send({
            error: 'You must provide an address!'
        })
    }

    geocode(req.query.address, (error, { latitude, longitude, location } = {}) => {
        if (error) {
            return res.send({ error })
        }

        forecast(latitude, longitude, (error, forecastData) => {
            if (error) {z
                return res.send({ error })
            }

            res.send({
                forecast: forecastData,
                location,
                address: req.query.address
            })
        })
    })
   
})



app.listen(3000, () => {
    console.log('Server is up.')
})