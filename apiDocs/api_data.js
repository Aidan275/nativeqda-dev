define({ "api": [
  {
    "type": "get",
    "url": "/api/analysis/watson/read",
    "title": "Read one Watson analysis",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>ObjectId of the analysis object</p>"
          }
        ]
      }
    },
    "group": "Analysis",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>ObjectId of the analysis object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of the analysis as given by the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "createdBy",
            "description": "<p>First name of the user who created the analysis</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "dateCreated",
            "description": "<p>The date the analysis was created</p>"
          },
          {
            "group": "Success 200",
            "type": "More",
            "optional": false,
            "field": "More",
            "description": "<p>More</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success 200",
          "content": "HTTP/1.1 200 OK\n[{\n  \"_id\": \"59c132da6bea374820a47f37\",\n  \"name\": \"Language Analysis\",\n  \"createdBy\": \"John\",\n  \"dateCreated\": \"2017-09-19T15:08:10.521Z\"\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error 500",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        },
        {
          "title": "Error 503",
          "content": "HTTP/1.1 503 Service Unavailable",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/app_api/routes/index.js",
    "groupTitle": "Analysis",
    "name": "GetApiAnalysisWatsonRead"
  },
  {
    "type": "get",
    "url": "/api/analysis/watson/read/categories",
    "title": "Read category results of a Watson analysis",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>ObjectId of the analysis object</p>"
          }
        ]
      }
    },
    "group": "Analysis",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "categories",
            "description": "<p>List of Category objects (Array of Objects)</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "categories.score",
            "description": "<p>Category score</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "categories.label",
            "description": "<p>Category label</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "categories._id",
            "description": "<p>Category id</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success 200",
          "content": " HTTP/1.1 200 OK\n \"categories\" : [{\n    \"score\" : 0.488511,\n    \"label\" : \"/pets/cats\",\n    \"_id\" : \"59c12f70af3cc9188cbf784b\"\n},\n{\n    \"score\" : 0.427007,\n    \"label\" : \"/home and garden\",\n    \"_id\" : \"59c12f70af3cc9188cbf784a\"\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error 500",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        },
        {
          "title": "Error 503",
          "content": "HTTP/1.1 503 Service Unavailable",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/app_api/routes/index.js",
    "groupTitle": "Analysis",
    "name": "GetApiAnalysisWatsonReadCategories"
  },
  {
    "type": "post",
    "url": "/api/analysis/watson",
    "title": "Perform Watson analysis - url",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "url",
            "description": "<p>URL to be analysed</p>"
          }
        ]
      }
    },
    "group": "Analysis",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>ObjectId of the analysis object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of the analysis as given by the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "createdBy",
            "description": "<p>First name of the user who created the analysis</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "dateCreated",
            "description": "<p>The date the analysis was created</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success 200",
          "content": "HTTP/1.1 200 OK\n[{\n  \"_id\": \"59c132da6bea374820a47f37\",\n  \"name\": \"Language Analysis\",\n  \"createdBy\": \"John\",\n  \"dateCreated\": \"2017-09-19T15:08:10.521Z\"\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error 500",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        },
        {
          "title": "Error 503",
          "content": "HTTP/1.1 503 Service Unavailable",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/app_api/routes/index.js",
    "groupTitle": "Analysis",
    "name": "PostApiAnalysisWatson"
  },
  {
    "type": "post",
    "url": "/api/analysis/watsonText",
    "title": "Perform Watson analysis - text",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "text",
            "description": "<p>String of text to be analysed</p>"
          }
        ]
      }
    },
    "group": "Analysis",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>ObjectId of the analysis object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of the analysis as given by the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "createdBy",
            "description": "<p>First name of the user who created the analysis</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "dateCreated",
            "description": "<p>The date the analysis was created</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success 200",
          "content": "HTTP/1.1 200 OK\n[{\n  \"_id\": \"59c132da6bea374820a47f37\",\n  \"name\": \"Language Analysis\",\n  \"createdBy\": \"John\",\n  \"dateCreated\": \"2017-09-19T15:08:10.521Z\"\n}]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error 500",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        },
        {
          "title": "Error 503",
          "content": "HTTP/1.1 503 Service Unavailable",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/app_api/routes/index.js",
    "groupTitle": "Analysis",
    "name": "PostApiAnalysisWatsontext"
  }
] });
