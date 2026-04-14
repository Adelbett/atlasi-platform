package com.atlasi.backend.controller;

import com.atlasi.backend.model.AtlasiRequest;
import com.atlasi.backend.repository.AtlasiRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * LoyaltyController — برنامج الولاء بالأطلسي
 *
 * Paliers fidélité (identiques à Landing.jsx côté client) :
 *   Commande 1   → aucune remise
 *   Commandes 2–4 → remise automatique 5%
 *   Commande 5+  → remise exceptionnelle 50% (demi-tarif)
 *
 * L'identifiant unique du client est son numéro de téléphone (clientPhone).
 */
@RestController
@RequestMapping("/api/loyalty")
@CrossOrigin(origins = "*")
public class LoyaltyController {

    @Autowired
    private AtlasiRequestRepository requestRepository;

    // ── Constantes de paliers ─────────────────────────────────────────
    private static final double DISCOUNT_SILVER   = 0.05;  // 5%  — commandes 2–3
    private static final double DISCOUNT_GOLD     = 0.10;  // 10% — commande 4
    private static final double DISCOUNT_PLATINUM = 0.50;  // 50% — commande 5+

    /** Renvoie true si le statut correspond à une commande annulée */
    private boolean isCancelled(String status) {
        if (status == null) return false;
        String s = status.toLowerCase();
        return s.contains("annul") || s.contains("cancel")
            || s.contains("ملغي") || s.contains("رفض");
    }

    /** Normalise un numéro (chiffres uniquement) */
    private String normalizePhone(String phone) {
        return phone == null ? "" : phone.replaceAll("[^0-9]", "");
    }

    // ── GET /api/loyalty/status/{phone} ──────────────────────────────
    /**
     * Retourne le statut de fidélité pour un numéro de téléphone donné.
     * Utilisé par le Wizard (Step 1) pour afficher le badge de remise.
     */
    @GetMapping("/status/{phone}")
    public Map<String, Object> getLoyaltyStatus(@PathVariable String phone) {
        String normalizedPhone = normalizePhone(phone);

        // Compter les commandes valides (non annulées) pour ce numéro
        long validOrders = requestRepository.findAll().stream()
            .filter(r -> normalizedPhone.equals(normalizePhone(r.getClientPhone())))
            .filter(r -> !isCancelled(r.getStatus()))
            .count();

        int nextOrderNumber = (int) validOrders + 1;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("phone", normalizedPhone);
        result.put("totalValidOrders", validOrders);
        result.put("nextOrderNumber", nextOrderNumber);

        if (nextOrderNumber >= 5) {
            result.put("discountRate",    DISCOUNT_PLATINUM);
            result.put("discountPercent", "50%");
            result.put("tier",            "بلاتيني");
            result.put("tierIcon",        "🏆");
            result.put("message",         "طلبك الخامس — خصم استثنائي 50% (نصف السعر)!");
        } else if (nextOrderNumber == 4) {
            result.put("discountRate",    DISCOUNT_GOLD);
            result.put("discountPercent", "10%");
            result.put("tier",            "ذهبي");
            result.put("tierIcon",        "🥉");
            result.put("message",         "طلبك الرابع — خصم 10%");
        } else if (nextOrderNumber >= 2) {
            result.put("discountRate",    DISCOUNT_SILVER);
            result.put("discountPercent", "5%");
            result.put("tier",            "فضي");
            result.put("tierIcon",        "🥈");
            result.put("message",         "طلبك رقم " + nextOrderNumber + " — خصم تلقائي 5%");
        } else {
            result.put("discountRate",    0.0);
            result.put("discountPercent", "—");
            result.put("tier",            "جديد");
            result.put("tierIcon",        "🆕");
            result.put("message",         "مرحباً بك! اجمع 4 طلبات وستحصل على خصومات حصرية.");
        }

        return result;
    }

    // ── GET /api/loyalty/all ─────────────────────────────────────────
    /**
     * Retourne la liste de fidélité de tous les clients.
     * Utilisé par le Dashboard Admin (page Loyalty).
     */
    @GetMapping("/all")
    public List<Map<String, Object>> getAllLoyalty() {
        List<AtlasiRequest> all = requestRepository.findAll();

        // Grouper par numéro de téléphone normalisé
        Map<String, List<AtlasiRequest>> byPhone = all.stream()
            .filter(r -> r.getClientPhone() != null && !r.getClientPhone().isEmpty())
            .collect(Collectors.groupingBy(r -> normalizePhone(r.getClientPhone())));

        return byPhone.entrySet().stream().map(entry -> {
            String normalizedPhone = entry.getKey();
            List<AtlasiRequest> orders = entry.getValue();

            long validCount = orders.stream()
                .filter(r -> !isCancelled(r.getStatus()))
                .count();

            String clientName = orders.stream()
                .filter(r -> r.getClientName() != null)
                .findFirst()
                .map(AtlasiRequest::getClientName)
                .orElse("—");

            Map<String, Object> client = new LinkedHashMap<>();
            client.put("phone",       normalizedPhone);
            client.put("clientName",  clientName);
            client.put("totalOrders", orders.size());
            client.put("validOrders", validCount);

            if (validCount >= 5) {
                client.put("tier",            "بلاتيني");
                client.put("discountRate",    DISCOUNT_PLATINUM);
                client.put("discountPercent", "50%");
            } else if (validCount >= 4) {
                client.put("tier",            "ذهبي");
                client.put("discountRate",    DISCOUNT_GOLD);
                client.put("discountPercent", "10%");
            } else if (validCount >= 2) {
                client.put("tier",            "فضي");
                client.put("discountRate",    DISCOUNT_SILVER);
                client.put("discountPercent", "5%");
            } else {
                client.put("tier",            "جديد");
                client.put("discountRate",    0.0);
                client.put("discountPercent", "—");
            }

            client.put("nextOrderDiscount", getNextOrderDiscount((int) validCount));

            return client;
        }).sorted(Comparator.comparingLong(m -> -((Number) m.get("validOrders")).longValue()))
          .collect(Collectors.toList());
    }

    // ── PUT /api/loyalty/override/{phone} ────────────────────────────
    /**
     * Permet à l'Admin de forcer manuellement le niveau de fidélité d'un client.
     * (Extension future — nécessite une entité LoyaltyOverride dédiée)
     */
    @PutMapping("/override/{phone}")
    public Map<String, Object> overrideLoyalty(
            @PathVariable String phone,
            @RequestBody Map<String, Object> body) {

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("phone",   normalizePhone(phone));
        result.put("message", "Fonctionnalité disponible dans la prochaine version (nécessite entité LoyaltyOverride).");
        return result;
    }

    // ── Helpers ───────────────────────────────────────────────────────
    private String getNextOrderDiscount(int validOrderCount) {
        int next = validOrderCount + 1;
        if (next >= 5) return "50%";
        if (next == 4) return "10%";
        if (next >= 2) return "5%";
        return "—";
    }
}
