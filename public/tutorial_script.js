{
    "mapName": "map02",
    "mapWidth": 100,
    "mapHeight": 100,
    "AI":[2],
    "player_num":2,
    "models":
    [
        {
            "name": "venus",
            "dirpath": "obj/planets/",
            "path": "venus.obj",
            "material":{
                "path": "venus.mtl"
            }
        },
        {
            "name": "mercury",
            "dirpath": "obj/planets/",
            "path": "mercury.obj",
            "material":{
                "path": "mercury.mtl"
            }
        },
        {
            "name": "mars",
            "dirpath": "obj/planets/",
            "path": "mars.obj",
            "material":{
                "path": "mars.mtl"
            }
        },
        {
            "name": "pluto",
            "dirpath": "obj/planets/",
            "path": "pluto.obj",
            "material":{
                "path": "pluto.mtl"
            }
        },
        {
            "name": "moon",
            "dirpath": "obj/planets/",
            "path": "moon.obj",
            "material":{
                "path": "moon.mtl"
            }
        },
        {
            "name": "earth",
            "dirpath": "obj/planets/",
            "path": "earth.obj",
            "material":{
                "path": "earth.mtl"
            }
        },
        {
            "name": "blackhole",
            "dirpath": "obj/planets/",
            "path": "blackhole.obj",
            "material":{
                "path": "blackhole.mtl"
            }
        },
        {
            "name": "whitehole",
            "dirpath": "obj/planets/",
            "path": "whitehole.obj",
            "material":{
                "path": "whitehole.mtl"
            }
        },
        {
            "name": "station",
            "dirpath": "obj/planets/",
            "path": "station.obj",
            "material":{
                "path": "station.mtl"
            }
        }


    ],
    "building_template":{
      "venus" : {
        "name": "venus",
        "curUnit": 10,
        "maxUnit": 70,
        "unit_vel": 0.25,
        "grow_cycle":40,
        "sent_unit_cycle":10,
        "scale":1
      },
      "moon" : {
        "name": "moon",
        "curUnit": 10,
        "maxUnit": 40,
        "grow_cycle":100000000,
        "scale":2
      },
      "station" : {
        "name": "station",
        "type":"station",
        "unit_vel": 0.4,
        "curUnit": 10,
        "maxUnit": 50,
        "grow_cycle":100000,
        "scale":1.5
      },
      "mercury" : {
        "name": "mercury",
        "curUnit": 20,
        "maxUnit": 50,
        "grow_cycle":80,
        "scale":1.5
      },
      "earth" : {
        "name": "earth",
        "curUnit": 15,
        "maxUnit": 40,
        "grow_cycle":900000000,
        "scale":1.5
      },
      "mars" : {
        "name": "mars",
        "curUnit": 25,
        "maxUnit": 60,
        "grow_cycle":70,
        "scale":1.5
      },
      "pluto" : {
        "name": "pluto",
        "curUnit": 10,
        "maxUnit": 30,
        "grow_cycle":120,
        "scale":3
      },
      "blackhole" : {
        "name": "blackhole",
        "curUnit": 1000,
        "maxUnit": 2000,
        "type":"black_hole"
      },
      "whitehole" : {
        "name": "whitehole",
        "type":"white_hole",
        "curUnit": 1000,
        "maxUnit": 2000
      }
    },
    "buildings":
    [
        {
            "template": "venus",
            "owner": 1,
            "curUnit": 10,
            "position": [40,0]
        },{
            "template": "moon",
            "owner": 0,
            "position": [0,0]
        },{
            "template": "earth",
            "owner": 2,
            "position": [-40,0]
        }
    ]
 }
