# GCP

## Compute Engine

```hcl
# This code is compatible with Terraform 4.25.0 and versions that are backwards compatible to 4.25.0.
# For information about validating this Terraform code, see https://developer.hashicorp.com/terraform/tutorials/gcp-get-started/google-cloud-platform-build#format-and-validate-the-configuration

resource "google_compute_instance" "instance-20260325-081059" {
  attached_disk {
    device_name = "swap-tmp"
    mode        = "READ_WRITE"
  }

  boot_disk {
    auto_delete = true
    device_name = "instance-20260325-081059"

    initialize_params {
      image = "projects/debian-cloud/global/images/debian-13-trixie-v20260310"
      size  = 30
      type  = "pd-standard"
    }

    mode = "READ_WRITE"
  }

  can_ip_forward      = false
  deletion_protection = false
  enable_display      = true

  labels = {
    goog-ec-src = "vm_add-tf"
  }

  machine_type = "e2-micro"

  metadata = {
    ssh-keys = "openpgp:0xB17F9ED3:ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHBAm5d2IeApyfv8zLb7IMpex7wVHkCV86ztON7HFTkn openpgp:0xB17F9ED3"
  }

  name = "instance-20260325-081059"

  network_interface {
    access_config {
      network_tier = "STANDARD"
    }

    queue_count = 0
    stack_type  = "IPV4_ONLY"
    subnetwork  = "projects/wide-plating-214310/regions/asia-east2/subnetworks/default"
  }

  reservation_affinity {
    type = "ANY_RESERVATION"
  }

  scheduling {
    automatic_restart   = true
    on_host_maintenance = "MIGRATE"
    preemptible         = false
    provisioning_model  = "STANDARD"
  }

  service_account {
    email  = "789759405604-compute@developer.gserviceaccount.com"
    scopes = ["https://www.googleapis.com/auth/devstorage.read_only", "https://www.googleapis.com/auth/logging.write", "https://www.googleapis.com/auth/monitoring.write", "https://www.googleapis.com/auth/service.management.readonly", "https://www.googleapis.com/auth/servicecontrol", "https://www.googleapis.com/auth/trace.append"]
  }

  shielded_instance_config {
    enable_integrity_monitoring = true
    enable_secure_boot          = false
    enable_vtpm                 = true
  }

  zone = "asia-east2-b"
}
```
