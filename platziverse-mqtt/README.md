#platziverse-mqtt

## `agent/connected`

``` js
{
    agent: {
        uuid, //auto generado
        username, //definir por configuracion
        name, //definir por configuracion
        hostname, //obtener del SO
        pid //obtenemos del proceso
    }
}
```

## `agent/disconnected`

``` js
{
    agent: {
        uuid
    }
}
```

## `agent/message`

``` js
{
    agent,
    metrics: [{
        type,
        value
    }],
    timestamp //generamos cuando creamos el mensaje
}
```