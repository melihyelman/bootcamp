package com.bootcamp.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotBlank(message = "Sipariş numarası boş bırakılamaz")
    private String orderNumber;

    @NotBlank(message = "Kart sahibi adı boş bırakılamaz")
    private String cardHolderName;

    @NotBlank(message = "Kart numarası boş bırakılamaz")
    private String cardNumber;

    @NotBlank(message = "Son kullanma ayı boş bırakılamaz")
    private String expireMonth;

    @NotBlank(message = "Son kullanma yılı boş bırakılamaz")
    private String expireYear;

    @NotBlank(message = "CVC boş bırakılamaz")
    private String cvc;

    @NotBlank(message = "Alıcı adı boş bırakılamaz")
    private String buyerName;

    @NotBlank(message = "Alıcı soyadı boş bırakılamaz")
    private String buyerSurname;

    @NotBlank(message = "Alıcı e-posta boş bırakılamaz")
    private String buyerEmail;

    @NotBlank(message = "TC Kimlik No boş bırakılamaz")
    private String buyerIdentityNumber;

    @NotBlank(message = "Şehir boş bırakılamaz")
    private String buyerCity;

    @NotBlank(message = "Ülke boş bırakılamaz")
    private String buyerCountry;
}
