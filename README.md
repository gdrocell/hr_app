Toy Administration Console
============================

### About

This web app is a toy administration console that allows an administrator to login to a console.  The Administrator can perform CRUD operations on configurations.
The default configurations are read in from a file called config.json.  When the administrator performs CRUD operations, the changes are persisted
to the config.json file.  If this were a real application, then it would be storing the configurations in a backend such as Mongo DB, Elasticsearch, 
Oracle, etc..

### Launch

Go to the root of the git repository that you have cloned.  Launch the server with the following command.

```
$ node hr_server.js
```

This will launch the http server on port 8081 by default.  The configurations are loaded from a file
called config.json.

### Login

When you visit the following url: http://localhost:8081/ in your web browser, you will see a login page.  The username and password are admin and !word respectively.

### Administrator Console

Once you are logged into the console, you will see five buttons total.  The first four buttons horizontally aligned at the top are for performing 
CRUD operations for the configurations.  If you select create button, then you will be displayed a form for creating a new configuration.  If you
select the retrieve button, then you will be displayed a form for retrieving configurations.  You can choose to retrieve all, or you can choose to paginate them
where you will be able to scroll through configurations by 10 configurations at a time.  Hit the next link to scroll forward and the previous link to scroll backward.
You can also choose a sort radio button to sort by name, hostname, port, or username when retrieving the configurations.  The update button will display a 
form for updating a configuration.  You must specify the name of which configuration you want to update, and then you can specify what the new values for that 
configuration will be.  The delete button will display a form for deleting a configuration by the configuration name.

The button at the bottom of the page below the horizontal line is for the administrator to logout of the console.

### Utilities

The genconfig.js is a utility that is used for generating configurations.  You can run it from the command prompt as follows...

```
$ node genconfig.js 100
```

The example command will generate a config.json file with 100 entries.

### Thanks

This was a fun, little project.

 