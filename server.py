#!/usr/bin/env Python
# coding=utf-8

import tornado.ioloop
import tornado.options
import tornado.httpserver
import logging
from application import application

from tornado.options import define, options

define("port", default=8080, type=int, help="Port to listen.")
define("static", default="./static/", help="entry point of static files")
define("debug", default=True, help="run in debug mode")
define("num_inst_per_group", default=20, type=int, help="Number of instances per group.")
def main():
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(options.port)

    print("Development server is running at http://127.0.0.1:%s" % options.port)
    print("Quit the server with Control-C")


    #logging.basicConfig(level=logging.NOTSET, filename='main.log')
    logging.basicConfig(level=logging.NOTSET)
    logger = logging.getLogger()
    #logger.setLevel(logging.NOTSET)
    
    logging.debug("Now in debug mode.")
    logging.info("Tornado server is now running. Listening on port %d", options.port)

    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()

