//  Carregando bibliotecas
const express = require('express')
const app = express()
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const fetch = require('cross-fetch')

// Conexão com o banco de dados

const connection = new Sequelize('cats_database_dev', 'guineapig', 'myguineapig', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
})

// Table creation

const Breeds = connection.define('breeds', {
    // nome_da_colua: {
    //     type: Sequelize.STRING,
    //     allowNull: false
    // },
    breed: {
        type: Sequelize.STRING,
        allowNull: false
    },

    origin: {
        type: Sequelize.STRING,
        allowNull: false
    },

    temperament: {
        type: Sequelize.STRING,
        allowNull: false
    },

    description: {
        type: Sequelize.TEXT,
        allowNull: false
    }
})

const Images = connection.define('images', {
    breed: {
        type: Sequelize.STRING,
        allowNull: false
    },

    image1: {
        type: Sequelize.STRING,
        allowNull: false
    },

    image2: {
        type: Sequelize.STRING,
        allowNull: false
    },

    image3: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

const Altern = connection.define('alternatives', {
    category: {
        type: Sequelize.STRING,
        allowNull: false
    },

    image1: {
        type: Sequelize.STRING,
        allowNull: false
    },

    image2: {
        type: Sequelize.STRING,
        allowNull: false
    },

    image3: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

// Sincronização da tabela

Breeds.sync({ force: true })
Images.sync({ force: true })
Altern.sync({ force: true })

// Teste de fetch

fetch('https://api.thecatapi.com/v1/breeds')
    .then((resp) => resp.json())
    .then((resp) => {
        const breeds = resp.map(breed => {
            return {
                name: breed.id,
                origin: breed.origin,
                temperament: breed.temperament,
                description: breed.description
            }
        })
        breeds.forEach(raca => {
            Breeds.create({
                breed: raca.name,
                origin: raca.origin,
                temperament: raca.temperament,
                description: raca.description
            })
        })

        breeds.forEach(raca => {
            fetch(`https://api.thecatapi.com/v1/images/search?breed_ids=${raca.name}&limit=3`)
                .then((resp) => resp.json())
                .then((resp) => {
                    const images = {
                        first: resp[0] ? resp[0].url : 'Empty',
                        second: resp[1] ? resp[1].url : 'Empty',
                        third: resp[2] ? resp[2].url : 'Empty',
                    }
                    Images.create({
                        breed: raca.name,
                        image1: images.first,
                        image2: images.second,
                        image3: images.third
                    })
                })
        })
    })

// Gatos com chapéu

fetch('https://api.thecatapi.com/v1/images/search?category_ids=1&limit=3')
    .then((resp) => resp.json())
    .then((resp) => {
        const images = {
            first: resp[0] ? resp[0].url : 'Empty',
            second: resp[1] ? resp[1].url : 'Empty',
            third: resp[2] ? resp[2].url : 'Empty'
        }

        Altern.create({
            category: "hats",
            image1: images.first,
            image2: images.second,
            image3: images.third
        })
    })

// Gatos de óculos

fetch('https://api.thecatapi.com/v1/images/search?category_ids=4&limit=3')
    .then((resp) => resp.json())
    .then((data) => {
        const images = {
            first: data[0] ? data[0].url : 'Empty',
            second: data[1] ? data[1].url : 'Empty',
            third: data[2] ? data[2].url : 'Empty'
        }

        Altern.create({
            category: "sunglasses",
            image1: images.first,
            image2: images.second,
            image3: images.third
        })
    })


// End points

app.get("/cats/breeds", (req, res) => {
    Breeds.findAll().then(items => {
        if (items.length > 0) {
            res.statusCode = 200;
            res.json(items);
        } else {
            res.statusCode = 404;
            res.send("Cannot find results.")
        }
    });
})

app.get("/cats/temperament=:temperament", (req, res) => {
    Breeds.findAll({
        where: {
            temperament: {
                [Op.like]: `%${req.params.temperament}%`
            }
        }
    }).then(items => {
        if (items.length > 0) {
            res.statusCode = 200;
            res.json(items);
        } else {
            res.statusCode = 404;
            res.send("Você não achou nada.");
        }
    });

})

app.get("/cats/origin=:origin", (req, res) => {
    Breeds.findAll({
        where: {
            origin: {
                [Op.like]: `%${req.params.origin}%`
            }
        }
    }).then(items => {
        if (items.length > 0) {
            res.statusCode = 200;
            res.json(items);
        } else {
            res.statusCode = 400;
            res.send("Cannot find results.");
        }
    });

})

// Server listening

app.listen(5914, () => {
    console.log("[Application] Listening at port 5914");
})