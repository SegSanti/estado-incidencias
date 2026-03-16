function generarEstadoJSON() {

  let label = GmailApp.getUserLabelByName("Incidencia IT");

  if (!label) {
    label = GmailApp.createLabel("Incidencia IT");
  }

  let threads = GmailApp.search('from:IT-Servicedesk@segulagrp.com -label:"Incidencia IT" newer_than:5m');

  let total = threads.length;

  Logger.log("Incidencias detectadas: " + total);

  let estado = {
    incidencia: total > 0,
    total: total,
    fecha: new Date().toISOString()
  };

  let contenido = JSON.stringify(estado, null, 2);
  subirJSONaGithub(contenido);

  threads.forEach(thread => {
    thread.addLabel(label);
  });

}

function subirJSONaGithub(contenido) {

  let token = "TOKEN";
  let repo = "SegSanti/estado-incidencias";
  let path = "estado_incidencias.json";

  let url = "https://api.github.com/repos/" + repo + "/contents/" + path;

  let response = UrlFetchApp.fetch(url, {
    method: "get",
    headers: {
      Authorization: "token " + token
    }
  });

  let data = JSON.parse(response.getContentText());

  let contenidoActual = Utilities.newBlob(
    Utilities.base64Decode(data.content)
  ).getDataAsString();

  let estadoActual = JSON.parse(contenidoActual);
  let estadoNuevo = JSON.parse(contenido);

  // Si el contenido es igual no hacemos commit
  if (estadoActual.total === estadoNuevo.total) {
    Logger.log("Total sin cambios, no se actualiza GitHub");
    return;
  }

  let payload = {
    message: "Actualizar estado incidencias",
    content: Utilities.base64Encode(contenido),
    sha: data.sha
  };

  UrlFetchApp.fetch(url, {
    method: "put",
    headers: {
      Authorization: "token " + token
    },
    contentType: "application/json",
    payload: JSON.stringify(payload)
  });

  Logger.log("Estado actualizado en GitHub");
}
