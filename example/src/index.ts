import aspida from "aspida-google-apps-script";
import api from "../api/$api";

function main() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const token = scriptProperties.getProperty("ecp-api-token");

  if (!token) throw new Error("ecp-api-token is not found.");

  const client = api(
    aspida(UrlFetchApp.fetch, {
      headers: {
        "ecp-api-token": token,
      },
    })
  );

  const res = client.foreign_population_2.get({
    query: { start_year: 2013, end_year: 2014 },
  });
  console.log(res.body);
}
