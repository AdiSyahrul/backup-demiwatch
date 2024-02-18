const Patient = require('../models/patientModel.js');
const User = require('../models/userModel.js');

async function tambahPatient(req, res) {
  const { nama, umur, jenisPenyakit, catatan, kode, alamatRumah, alamatTujuan } = req.body;
  if (!nama || !umur || !jenisPenyakit || !catatan || !kode || !alamatRumah || !alamatTujuan) {
    return res.status(400).json({
      status: 400,
      success: false,
      error: 'Each column must be filled in'
    });
  }

  try {
    const existingKode = await Patient.findOne({ kode });
    if (existingKode) {
      return res.status(400).json({
        status: 400,
        success: false,
        error: 'Kode already used in another device'
      });
    }
    const user = await User.findById(req.user.userId);
    if (user.patients.length >= 1) {
      return res.status(400).json({
        status: 400,
        success: false,
        error: 'You already have a patient. Cannot add more than one patient.'
      });
    }
    const dataPatient = await Patient.create({
      nama,
      umur,
      jenisPenyakit,
      catatan,
      kode,
      alamatRumah,
      alamatTujuan,
      createdBy: req.user.userId
    });
    // const user = await User.findByIdAndUpdate(
    //   req.user.userId,
    //   { $push: { patients: dataPatient._id } },
    //   { new: true }
    // );
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { patients: [dataPatient._id] } }, // Menggunakan $set untuk mengganti array patients
      { new: true }
    );


    res.status(200).json({
      status: 200,
      success: true,
      message: 'Patient data saved successfully', 
      data: dataPatient,
      user : {nama: updatedUser.nama, email: updatedUser.email}
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 500,
      success: false,
      error: "An error occurred while saving patient data"
    });
  }
}

async function getPatient(req, res) {
  const { id } = req.params; 

  try {
    const dataPatient = await Patient.findById(id);

    if (!dataPatient) {
      return res.status(404).json({
        status: 404,
        success: false,
        error: 'Patient data not found'
      });
    }
    if (dataPatient.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        status: 403,
        success: false,
        error: 'You do not have permission to access this patient data'
      });
    }
    res.status(200).json({
      status: 200,
      success: true,
      message: 'Successfully get data patient',
      data: dataPatient
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      success: false,
      error: 'An error occurred while retrieving patient data'
    });
  }
}

async function updatePatient(req, res){
  const { id } = req.params;
  let { nama, umur, jenisPenyakit, catatan, kode, alamatRumah, alamatTujuan} = req.body;
  try {
    let existingPatient = await Patient.findById(id);
    if (!existingPatient) {
      return res.status(404).json({
        status: 404,
        success: false,
        error: 'Patient data not found'
      });
    }

    if (existingPatient.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        status: 403,
        success: false,
        error: 'You do not have permission to update this patient data'
      });
    }
    
    if (typeof alamatRumah === 'string') alamatRumah = JSON.parse(alamatRumah);
    if (typeof alamatTujuan === 'string') alamatTujuan = JSON.parse(alamatTujuan);

    alamatRumah = {
      name: alamatRumah.name,
      longi: alamatRumah.longi || alamatRumah.longitude,
      lat: alamatRumah.lat || alamatRumah.latitude
    };

    alamatTujuan = {
      name: alamatTujuan.name,
      longi: alamatTujuan.longi || alamatTujuan.longitude,
      lat: alamatTujuan.lat || alamatTujuan.latitude
    };
    existingPatient.nama = nama || existingPatient.nama;
    existingPatient.umur = umur || existingPatient.umur;
    existingPatient.jenisPenyakit = jenisPenyakit || existingPatient.jenisPenyakit;
    existingPatient.catatan = catatan || existingPatient.catatan;
    existingPatient.kode = kode || existingPatient.kode;
    existingPatient.alamatRumah = alamatRumah || existingPatient.alamatRumah;
    existingPatient.alamatTujuan = alamatTujuan || existingPatient.alamatTujuan;

    await existingPatient.save();

    res.json({
      status: 200,
      success: true,
      message: 'Patient data is updated successfully',
      data: existingPatient // Kirim kembali data yang telah diperbarui
    });
  } catch (error) {
    console.error(error); // Untuk debugging
    res.status(500).json({
      status: 500,
      success: false,
      error: 'An error occurred while updating patient data'
    });
  }
  //   const updatedPatient = await Patient.findByIdAndUpdate(id, {
  //     nama,
  //     umur,
  //     jenisPenyakit,
  //     catatan,
  //     kode,
  //     alamatRumah,
  //     alamatTujuan,
  //   }, { new: true });

  //   if (!updatedPatient) {
  //     return res.status(404).json({
  //       status: 404,
  //       success: false,
  //       error: 'Patient data not found'
  //     });
  //   }

  //   res.json({
  //     status: 200,
  //     success: true,
  //     message: 'Patient data is updated successfully',
  //     data: updatedPatient
  //   });
  // } catch (error) {
  //   res.status(500).json({
  //     status: 500,
  //     success: false,
  //     error: 'An error occurred while updating patient data'
  //   });
  // }
}

async function getPatientByKode(kode) {
  return await Patient.findOne({ kode: kode });
}

module.exports = {
  tambahPatient,
  getPatient,
  updatePatient,
  getPatientByKode
};