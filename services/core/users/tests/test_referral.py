from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class RedeemReferralTests(APITestCase):
    def setUp(self):
        self.referrer = User.objects.create_user(
            username="referrer",
            email="referrer@example.com",
            password="password",
        )
        self.redeemer = User.objects.create_user(
            username="redeemer",
            email="redeemer@example.com",
            password="password",
        )
        self.url = reverse("redeem_referral")

    def test_redeem_referral_awards_both_users(self):
        self.client.force_authenticate(user=self.redeemer)

        response = self.client.post(
            self.url,
            {"code": self.referrer.profile.referral_code.lower()},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.redeemer.profile.refresh_from_db()
        self.referrer.profile.refresh_from_db()

        self.assertEqual(self.redeemer.profile.referred_by, self.referrer)
        self.assertEqual(self.redeemer.profile.xp, 100)
        self.assertEqual(self.referrer.profile.xp, 100)

    def test_cannot_redeem_referral_twice(self):
        self.client.force_authenticate(user=self.redeemer)

        first = self.client.post(
            self.url,
            {"code": self.referrer.profile.referral_code},
            format="json",
        )
        second = self.client.post(
            self.url,
            {"code": self.referrer.profile.referral_code},
            format="json",
        )

        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)
