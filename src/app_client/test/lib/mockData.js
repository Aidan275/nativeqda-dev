/*jshint maxlen:120 */
/*jshint -W079 */
var mockData = (function() {
	return {
		getLoginToken			: getLoginToken,
		mockListWatsonAnalysis	: mockListWatsonAnalysis,
		watsonTextAnalysis 		: watsonTextAnalysis,
		readWatsonAnalysis 		: readWatsonAnalysis
	};

	function getLoginToken() {
		return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTg1NWI1MjU5NGMyZjJjNTBkNzVhYjciLCJlbWFpbCI6ImFhMjc1QHVvd21haWwuZWR1LmF1IiwiZmlyc3ROYW1lIjoiQWlkYW4iLCJzZXR0aW5ncyI6Int9IiwiYXZhdGFyIjoiaHR0cHM6Ly9uYXRpdmVxZGEtYXNzZXRzLWRldi5zMy1hcC1zb3V0aGVhc3QtMi5hbWF6b25hd3MuY29tL2F2YXRhcnMlMkYyMDE3JTJGMDglMkYxMyUyRjc1NWQ0OTk1ZmUxZmE2YzIxZTQ0LmdpZiIsImV4cCI6MTUwNjIxNTgwNSwiaWF0IjoxNTA1NjExMDA1fQ._HotbvK2RhQdtbsyMqXH9q5pPZdpEwk5VbkuZt_RyN8";
	}

	function mockListWatsonAnalysis() {
		return [
		{ text: 'text' },
		{ text: 'text2'}
		];
	}

	function watsonTextAnalysis() {
		return [
		{ text: 'text' },
		{ text: 'text2'}
		];
	}

	function readWatsonAnalysis() {
		return {
			"_id" : "59679c9c5aa3e61e6452d380",
			"language" : "en",
			"sourceDataKey" : "2017/07/1b83823e048ebca5c252-NASA reveals space weapon to stop asteroids.txt",
			"createdBy" : "Aidan",
			"description" : "NASA reveals space weapon to stop asteroids",
			"name" : "NASA",
			"categories" : [ 
			{
				"score" : 0.471589,
				"label" : "/science/physics",
				"_id" : "59679c9c5aa3e61e6452d383"
			}, 
			{
				"score" : 0.422529,
				"label" : "/business and industrial/aerospace and defense/space technology",
				"_id" : "59679c9c5aa3e61e6452d382"
			}, 
			{
				"score" : 0.345501,
				"label" : "/hobbies and interests/paranormal phenomena/occult",
				"_id" : "59679c9c5aa3e61e6452d381"
			}
			],
			"semanticRoles" : [ 
			{
				"sentence" : "NASA reveals space weapon to stop asteroids but what happens if it fails?",
				"_id" : "59679c9c5aa3e61e6452d511",
				"action" : {
					"text" : "reveals",
					"normalized" : "reveal",
					"verb" : {
						"text" : "reveal",
						"tense" : "present"
					}
				},
				"object" : {
					"text" : "space weapon to stop asteroids but what happens if it fails"
				},
				"subject" : {
					"text" : "NASA"
				}
			}, 
			{
				"sentence" : " A MASSIVE asteroid hitting Earth would create heat, pressure, tsunamis and flying debris but strong winds would be more deadly than anything else.",
				"_id" : "59679c9c5aa3e61e6452d510",
				"action" : {
					"text" : "hitting",
					"normalized" : "hit",
					"verb" : {
						"text" : "hit",
						"tense" : "present"
					}
				},
				"object" : {
					"text" : "Earth"
				},
				"subject" : {
					"text" : "A MASSIVE asteroid"
				}
			}
			],
			"relations" : [ 
			{
				"type" : "agentOf",
				"sentence" : "NASA revealed a space weapon that could stop a lurking apocalyptic asteroid from hitting earth but, if the plan fails, Armageddon could be more real than we think.",
				"score" : 0.98477,
				"_id" : "59679c9c5aa3e61e6452d4db",
				"arguments" : [ 
				{
					"text" : "NASA",
					"_id" : "59679c9c5aa3e61e6452d4de",
					"entities" : [ 
					{
						"type" : "Organization",
						"text" : "NASA",
						"_id" : "59679c9c5aa3e61e6452d4df"
					}
					]
				}, 
				{
					"text" : "revealed",
					"_id" : "59679c9c5aa3e61e6452d4dc",
					"entities" : [ 
					{
						"type" : "EventCommunication",
						"text" : "revealed",
						"_id" : "59679c9c5aa3e61e6452d4dd"
					}
					]
				}
				]
			}, 
			{
				"type" : "partOfMany",
				"sentence" : "Research on the event by Italian researcher, physicist Giuseppe Longo from the University of Bologna, found the explosion would have been capable of destroying a large city.",
				"score" : 0.873544,
				"_id" : "59679c9c5aa3e61e6452d4d6",
				"arguments" : [ 
				{
					"text" : "researcher",
					"_id" : "59679c9c5aa3e61e6452d4d9",
					"entities" : [ 
					{
						"type" : "Person",
						"text" : "Giuseppe Longo",
						"_id" : "59679c9c5aa3e61e6452d4da"
					}
					]
				}, 
				{
					"text" : "Italian",
					"_id" : "59679c9c5aa3e61e6452d4d7",
					"entities" : [ 
					{
						"type" : "GeopoliticalEntity",
						"text" : "Italian",
						"_id" : "59679c9c5aa3e61e6452d4d8"
					}
					]
				}
				]
			}, 
			{
				"type" : "employedBy",
				"sentence" : "Research on the event by Italian researcher, physicist Giuseppe Longo from the University of Bologna, found the explosion would have been capable of destroying a large city.",
				"score" : 0.705389,
				"_id" : "59679c9c5aa3e61e6452d4d1",
				"arguments" : [ 
				{
					"text" : "Giuseppe Longo",
					"_id" : "59679c9c5aa3e61e6452d4d4",
					"entities" : [ 
					{
						"type" : "Person",
						"text" : "Giuseppe Longo",
						"_id" : "59679c9c5aa3e61e6452d4d5"
					}
					]
				}, 
				{
					"text" : "University of Bologna",
					"_id" : "59679c9c5aa3e61e6452d4d2",
					"entities" : [ 
					{
						"type" : "Organization",
						"text" : "University of Bologna",
						"_id" : "59679c9c5aa3e61e6452d4d3"
					}
					]
				}
				]
			}
			],
			"keywords" : [ 
			{
				"text" : "asteroid hitting Earth",
				"relevance" : 0.907339,
				"_id" : "59679c9c5aa3e61e6452d42b",
				"emotion" : {
					"sadness" : 0.279437,
					"joy" : 0.082132,
					"fear" : 0.374545,
					"disgust" : 0.096414,
					"anger" : 0.35475
				},
				"sentiment" : {
					"score" : -0.581992
				}
			}, 
			{
				"text" : "asteroid hits earth",
				"relevance" : 0.817574,
				"_id" : "59679c9c5aa3e61e6452d42a",
				"emotion" : {
					"sadness" : 0.448019,
					"joy" : 0.042117,
					"fear" : 0.154958,
					"disgust" : 0.040536,
					"anger" : 0.53389
				},
				"sentiment" : {
					"score" : 0
				}
			}
			],
			"entities" : [ 
			{
				"type" : "Organization",
				"text" : "NASA",
				"relevance" : 0.820948,
				"count" : 5,
				"_id" : "59679c9c5aa3e61e6452d3bc",
				"disambiguation" : {
					"name" : "NASA",
					"dbpedia_resource" : "http://dbpedia.org/resource/NASA",
					"subtype" : [ 
					"Company", 
					"GovernmentAgency", 
					"AirportOperator", 
					"AwardPresentingOrganization", 
					"SoftwareDeveloper", 
					"SpaceAgency", 
					"SpacecraftManufacturer"
					]
				},
				"emotion" : {
					"sadness" : 0.450067,
					"joy" : 0.110905,
					"fear" : 0.259851,
					"disgust" : 0.056876,
					"anger" : 0.321753
				},
				"sentiment" : {
					"score" : -0.488303
				}
			}, 
			{
				"type" : "Person",
				"text" : "Professor Hawking",
				"relevance" : 0.746257,
				"count" : 3,
				"_id" : "59679c9c5aa3e61e6452d3bb",
				"disambiguation" : {
					"subtype" : []
				},
				"emotion" : {
					"sadness" : 0.47931,
					"joy" : 0.208504,
					"fear" : 0.042048,
					"disgust" : 0.114653,
					"anger" : 0.291189
				},
				"sentiment" : {
					"score" : 0
				}
			}
			],
			"concepts" : [ 
			{
				"text" : "Asteroid",
				"relevance" : 0.95447,
				"dbpedia_resource" : "http://dbpedia.org/resource/Asteroid",
				"_id" : "59679c9c5aa3e61e6452d3a1"
			}, 
			{
				"text" : "Impact event",
				"relevance" : 0.895125,
				"dbpedia_resource" : "http://dbpedia.org/resource/Impact_event",
				"_id" : "59679c9c5aa3e61e6452d3a0"
			}
			],
			"lastModified" : "2017-07-13T16:15:24.819Z",
			"dateCreated" : "2017-07-13T16:15:24.819Z",
			"__v" : 0
		};
	}

})();
