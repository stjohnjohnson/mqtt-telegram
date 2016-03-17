# MQTT Telegram
***Uploads MQTT images to Telegram users.***

[![GitHub tag](https://img.shields.io/github/tag/stjohnjohnson/mqtt-telegram.svg)](https://github.com/stjohnjohnson/mqtt-telegram/releases)
[![Docker Pulls](https://img.shields.io/docker/pulls/stjohnjohnson/mqtt-telegram.svg)](https://hub.docker.com/r/stjohnjohnson/mqtt-telegram/)
[![Docker Stars](https://img.shields.io/docker/stars/stjohnjohnson/mqtt-telegram.svg)](https://hub.docker.com/r/stjohnjohnson/mqtt-telegram/)

# Configuration

The telegram bridge has one yaml file for configuration:

```
---
mqtt:
    # Specify your MQTT Broker's hostname or IP address here
    host: localhost

telegram:
    # Token to talk to Telegram
    token: INSERT_TOKEN_HERE

# Where to send events to
topics:
    sample/topic:
        - INSERT_CHAT_ID

```

# Usage

1. Run the Docker container

    ```
    $ docker run \
        -d \
        --name="mqtt-telegram" \
        -v /opt/mqtt-telegram:/config \
        -p 8080:8080 \
        stjohnjohnson/mqtt-telegram
    ```
2. Customize the MQTT host and Telegram tokens

    ```
    $ vi /opt/mqtt-telegram/config.yml
    $ docker restart mqtt-telegram
    ```
3. Any images posted to those topics will be forwarded as photos to Telegram
