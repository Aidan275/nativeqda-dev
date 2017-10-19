/**
* @author Aidan Andrews
* @email aa275@uowmail.edu.au
* @ngdoc overview
* @name index
* @description
* # NativeQDA Front End Documentation
* ## Introduction
* The documentation on this site is generated from inline comments made throughout the code using ngDocs. 
* This is the front end documentation and describes the modules, services, directives, filters, controllers, and all the 
* other components that make up a typical AngularJS application.
* 
* Throughout the development of NativeQDA, we attempted to modularise the application as much as possible to enable code reuse, simple modification, and easier testing. 
*
* The main module is the {@link nativeQDA nativeQDA} module which links together all the third party modules and the two sub-modules {@link common common} and {@link components components}.
*
* The {@link common common} module then links together the directives, factories, filters, and services sub-modules, and each of these consist of a number of components such as the navigation directive and so on. 
* The {@link components components} module links together the {@link analysis analysis}, {@link auth auth}, {@link datasets datasets}, {@link files files}, {@link home home}, {@link map map}, {@link settings settings}, 
* {@link survey survey}, and {@link visualisations visualisations} sub-modules. Each of these sub-modules also consists of a number of controllers, views, and templates such as the 
* {@link newAnalysisCtrl.controller:analysis analysis} in the {@link analysis analysis} module. 

*/