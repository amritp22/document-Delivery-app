package com.delivery.citycourier.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import java.net.http.HttpRequest;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.delivery.citycourier.dto.Coordinates;

    @Service
    public class NominatimService {
        public Coordinates getCoordinatesFromAddress(String address) {
            try {
                String url = "https://nominatim.openstreetmap.org/search?q=" + 
                    URLEncoder.encode(address, StandardCharsets.UTF_8) +
                    "&format=json&limit=1";

                HttpClient client = HttpClient.newHttpClient();
                HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "YourAppName")
                    .build();

                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                JSONArray arr = new JSONArray(response.body());
                if (arr.length() == 0) return null;

                JSONObject obj = arr.getJSONObject(0);
                return new Coordinates(obj.getDouble("lat"), obj.getDouble("lon"));
            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        }
        
        public String getAddressFromCoordinates(double lat, double lon) {
            try {
                String urlStr = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + lon;
                URL url = new URL(urlStr);
                HttpURLConnection con = (HttpURLConnection) url.openConnection();
                con.setRequestMethod("GET");
                con.setRequestProperty("User-Agent", "Mozilla/5.0");

                BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
                String inputLine;
                StringBuilder response = new StringBuilder();
                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                in.close();

                JSONObject json = new JSONObject(response.toString());
                return json.getString("display_name");

            } catch (Exception e) {
                e.printStackTrace();
                return "an unknown location";
            }
        }

    }
